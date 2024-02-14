import * as fs from 'fs';
import minimist from 'minimist';
import * as pathI from 'path';

import {
	ARTIFACT_TYPES_BY_FILE,
	ArtifactEnum,
	CONTENT_TYPES,
	PoolClient,
	PoolConfigType,
	RENDER_WITH_VALUE,
	TAGS,
} from 'arcframework';

import { createAsset, createTransaction } from '../../api';
import { exitProcess, log, processMediaPath, walk } from '../../helpers/utils';

const sentFilesFilename = 'sentFiles.json';
let sentFiles = [];
let sentFilesFilepath = null;

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
	const poolClient = new PoolClient({ poolConfig });

	console.log('Mining files');

	const path = argv['path'];
	const metaFile = argv['meta-file'];
	const clear = argv['clear'];

	if (!path) {
		log('Provide a file path (--path)', 1);
		return;
	}

	let metaConfig = null;

	if (metaFile) {
		if (!fs.existsSync(metaFile) || !fs.statSync(metaFile).isFile()) {
			exitProcess('Metadata file not found or is not a file', 1);
		}
		try {
			const metaFileData = fs.readFileSync(metaFile, 'utf-8');
			metaConfig = JSON.parse(metaFileData);
		} catch (e: any) {
			log(e, 1);
			exitProcess('Failed to parse metadata config', 1);
		}
	}

	if (fs.existsSync(path)) {
		if (fs.statSync(path).isFile()) {
			log('Archiving file...', 0);
			try {
				await archiveFile(poolClient, metaConfig, path, null);
			} catch (e: any) {
				console.error(e);
			}
		} else if (fs.statSync(path).isDirectory()) {
			log('Archiving directory...', 0);
			try {
				genSentFiles(path, clear);
				await archiveDirectory(poolClient, metaConfig, path);
			} catch (e: any) {
				console.error(e);
			}
		} else {
			exitProcess('Path is not a file or directory.', 1);
		}
	} else {
		exitProcess('Path not found.', 1);
	}

	log('Completed file list', 0);
}

function genSentFiles(path: string, clear: boolean) {
	sentFilesFilepath = pathI.join(path, sentFilesFilename);
	if (clear) {
		fs.rmSync(sentFilesFilepath);
	}
	if (fs.existsSync(sentFilesFilepath) && fs.statSync(sentFilesFilepath).isFile()) {
		const fileData = fs.readFileSync(sentFilesFilepath, 'utf-8');
		sentFiles = JSON.parse(fileData);
	} else {
		fs.writeFileSync(sentFilesFilepath, '[]');
	}
}

function findFileConfig(fileName: string, metaConfig: any) {
	if (metaConfig) {
		return metaConfig.find((obj: any) => obj['FileName'] === fileName);
	} else {
		return null;
	}
}

async function archiveDirectory(poolClient: PoolClient, metaConfig: any, path: string) {
	for await (const f of walk(path)) {
		if (pathI.basename(f) !== sentFilesFilename) {
			if (!sentFiles.includes(pathI.basename(f))) {
				await archiveFile(poolClient, metaConfig, f, path);
			} else {
				log(`Skipping ${pathI.basename(f)}: Run with --clear option to resend`, 1);
			}
		}
	}
}

async function archiveFile(poolClient: PoolClient, metaConfig: any, path: string, dir: string | null) {
	let fileName = pathI.basename(path);
	let fileConfig = findFileConfig(fileName, metaConfig);

	let name = fileConfig && fileConfig['ArtifactName'] ? fileConfig['ArtifactName'] : fileName;
	let metadata = fileConfig && fileConfig['MetaData'] ? fileConfig['MetaData'] : {};
	let fileType = pathI.extname(path).slice(1);
	let grouped = fileConfig && fileConfig['ArtifactGroup'] && fileConfig['ArtifactGroupSequence'];
	let associationId = grouped ? fileConfig['ArtifactGroup'] : null;
	let associationSequence = associationId ? fileConfig['ArtifactGroupSequence'] : null;

	let fileTxId: string | null = null;
	let metadataTxId: string | null = null;

	try {
		fileTxId = await processFile(poolClient, path);
	} catch (e: any) {
		throw new Error(e);
	}

	try {
		const metadataTxTags = [
			{ name: TAGS.keys.application, value: TAGS.values.application },
			{ name: TAGS.keys.contentType, value: CONTENT_TYPES.json },
		];
		metadataTxId = await createTransaction(poolClient, {
			content: metadata,
			contentType: CONTENT_TYPES.json,
			tags: metadataTxTags,
		});
	} catch (e: any) {
		throw new Error(e);
	}

	let fileJson = {
		fileTxId: fileTxId,
		metadataTxId: metadataTxId,
	};

	let ansType: string;
	let alexType = ARTIFACT_TYPES_BY_FILE[fileType] ? ARTIFACT_TYPES_BY_FILE[fileType] : ArtifactEnum.File;
	switch (alexType) {
		case ArtifactEnum.Video:
			ansType = TAGS.values.ansTypes.video;
			break;
		case ArtifactEnum.Audio:
			ansType = TAGS.values.ansTypes.music;
			break;
		case ArtifactEnum.Image:
			ansType = TAGS.values.ansTypes.image;
			break;
		case ArtifactEnum.Document:
			ansType = TAGS.values.ansTypes.document;
			break;
		case ArtifactEnum.Ebook:
			ansType = TAGS.values.ansTypes.document;
			break;
		case ArtifactEnum.File:
			ansType = TAGS.values.ansTypes.file;
			break;
	}

	let asset = await createAsset(poolClient, {
		index: { path: 'file.json' },
		paths: (assetId: string) => ({ 'file.json': { id: assetId } }),
		content: fileJson,
		contentType: CONTENT_TYPES.json,
		artifactType: alexType,
		name: name,
		description: name,
		type: ansType,
		additionalMediaPaths: [],
		profileImagePath: null,
		associationId: associationId,
		associationSequence: associationSequence,
		childAssets: null,
		renderWith: RENDER_WITH_VALUE,
		assetId: fileTxId,
		fileType: fileType,
	});

	if (asset) {
		if (dir) {
			sentFiles.push(fileName);
			fs.writeFileSync(sentFilesFilepath, JSON.stringify(sentFiles));
		}
	}
}

async function processFile(poolClient: PoolClient, filePath: string) {
	try {
		const subTags = [{ name: TAGS.keys.application, value: TAGS.values.application }];
		let id = await processMediaPath(poolClient, filePath, {
			subTags: subTags,
			tmpdir: null,
			path: filePath,
			keepFile: true,
		});
		return id;
	} catch (e) {
		throw new Error(e);
	}
}
