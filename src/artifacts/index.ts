import fs from "fs";
import clc from "cli-color";

import { createData } from "arbundles"
import { ArweaveSigner } from "arbundles/src/signing";

import { ArtifactEnum, IPoolClient } from "../helpers/types";
import { TAGS, CONTENT_TYPES, MANIFEST } from "../helpers/config";
import { PoolClient } from "../clients/pool";
import { contentType } from "mime-types";
import { exitProcess } from "../helpers/utils";

export async function createAsset(poolClient: PoolClient, args: {
  index: any,
  paths: any,
  content: any,
  contentType: string,
  artifactType: ArtifactEnum,
  name: string,
  description: string,
  type: string,
  additionalMediaPaths: any,
  profileImagePath: any,
  associationId: string | null,
  associationSequence: string | null
}) {
  const assetId: string = await deployToBundlr(poolClient, {
    content: args.content,
    contentType: args.contentType
  });

  const contractData = await createContractData(poolClient, {
    index: args.index,
    paths: args.paths,
    contentType: args.contentType,
    artifactType: args.artifactType,
    name: args.name,
    description: args.description,
    type: args.type,
    additionalMediaPaths: args.additionalMediaPaths,
    profileImagePath: args.profileImagePath,
    associationId: args.associationId,
    associationSequence: args.associationSequence,
    assetId: assetId,
  });

  const contractId = await deployToWarp(poolClient, { contractData: contractData });
  if (contractId) {
    console.log(`Deployed Contract - [`, clc.green(`'${contractId}'`), `]`);
  }
}

async function deployToBundlr(poolClient: IPoolClient, args: {
  content: any,
  contentType: string
}) {
  let finalContent: any;

  switch (args.contentType) {
    case (CONTENT_TYPES.json as any):
      finalContent = JSON.stringify(args.content);
      break;
    default:
      finalContent = args.content;
      break;
  }

  const assetTags = [{ name: TAGS.keys.contentType, value: args.contentType }];
  const assetTx = poolClient.bundlr.createTransaction(finalContent, { tags: assetTags });
  await assetTx.sign();

  try {
    const cost = await poolClient.bundlr.getPrice(assetTx.size);

    try {
      await poolClient.bundlr.fund(cost.multipliedBy(1.1).integerValue());
    }
    catch (e: any) {
      exitProcess(`Error funding bundlr ...\n ${e}`, 1);
    }

    const assetBundlrResponse = await assetTx.upload();
    return assetBundlrResponse.id
  }
  catch (e: any) {
    exitProcess(`Error getting bundlr cost ...\n ${e}`, 1);
  }

  return null;
}

async function deployToWarp(poolClient: IPoolClient, args: {
  contractData: any
}) {
  try {
    const signer = new ArweaveSigner(JSON.parse(fs.readFileSync(poolClient.poolConfig.walletPath).toString()));
    const dataItem = createData(args.contractData.data, signer, { tags: args.contractData.tags });
    await dataItem.sign(signer);
    await poolClient.warp.createContract.deployBundled(dataItem.getRaw());
    return dataItem.id;
  }
  catch (e: any) {
    exitProcess(clc.red(`Error deploying to warp ...\n ${e}`), 1);
  }

  return null;
}

async function createContractData(poolClient: IPoolClient, args: {
  index: any,
  paths: any,
  contentType: string,
  artifactType: ArtifactEnum,
  name: string,
  description: string,
  type: string,
  additionalMediaPaths: any,
  profileImagePath: any,
  associationId: string | null,
  associationSequence: string | null,
  assetId: string
}) {
  const dateTime = new Date().getTime().toString();
  const tokenHolder = await getRandomContributor(poolClient);

  const initStateJson = JSON.stringify({
    ticker: TAGS.values.initState.ticker(args.assetId),
    balances: {
      [tokenHolder]: 1
    },
    contentType: contentType,
    description: args.description,
    lastTransferTimestamp: null,
    lockTime: 0,
    maxSupply: 1,
    title: TAGS.values.initState.title(args.name),
    name: TAGS.values.initState.name(args.name),
    transferable: false,
    dateCreated: dateTime,
    owner: tokenHolder
  }).replace(/[\u007F-\uFFFF]/g, function (chr) {
    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
  });

  const tagList: any[] = [
    { name: TAGS.keys.appName, value: TAGS.values.appName },
    { name: TAGS.keys.appVersion, value: TAGS.values.appVersion },
    { name: TAGS.keys.contentType, value: CONTENT_TYPES.arweaveManifest },
    { name: TAGS.keys.contractSrc, value: poolClient.poolConfig.contracts.nft.src },
    { name: TAGS.keys.poolId, value: poolClient.poolConfig.contracts.pool.id },
    { name: TAGS.keys.title, value: args.name },
    { name: TAGS.keys.description, value: args.description },
    { name: TAGS.keys.type, value: args.type },
    { name: TAGS.keys.artifactSeries, value: TAGS.values.application },
    { name: TAGS.keys.artifactName, value: args.name },
    { name: TAGS.keys.initialOwner, value: tokenHolder },
    { name: TAGS.keys.dateCreated, value: dateTime },
    { name: TAGS.keys.artifactType, value: args.artifactType },
    { name: TAGS.keys.keywords, value: JSON.stringify(poolClient.poolConfig.keywords) },
    { name: TAGS.keys.mediaIds, value: args.additionalMediaPaths ? JSON.stringify(args.additionalMediaPaths) : "" },
    { name: TAGS.keys.profileImage, value: args.profileImagePath ? JSON.stringify(args.profileImagePath) : "" },
    { name: TAGS.keys.associationId, value: args.associationId ? args.associationId : "" },
    { name: TAGS.keys.associationSequence, value: args.associationSequence ? args.associationSequence : "" },
    { name: TAGS.keys.implements, value: TAGS.values.ansVersion },
    { name: TAGS.keys.initState, value: initStateJson }
  ];

  for (let i = 0; i < poolClient.poolConfig.topics.length; i++) {
    tagList.push(
      { name: TAGS.keys.topic(poolClient.poolConfig.topics[i]), value: poolClient.poolConfig.topics[i] }
    );
  }

  return {
    data: JSON.stringify({
      manifest: MANIFEST.type,
      version: MANIFEST.version,
      index: args.index,
      paths: args.paths(args.assetId)
    }),
    tags: tagList
  }
}

async function getRandomContributor(poolClient: IPoolClient) {
  const evaluationResults: any = await poolClient.contract.readState();
  const state = evaluationResults.cachedValue.state;
  return selectTokenHolder(state.tokens, state.totalSupply);
}

export function selectTokenHolder(tokens: any, totalSupply: number) {
  const weights: { [key: string]: any } = {};
  for (const address of Object.keys(tokens)) {
    weights[address] = tokens[address] / totalSupply;
  }
  let sum = 0;
  const r = Math.random();
  for (const address of Object.keys(weights)) {
    sum += weights[address];
    if (r <= sum && weights[address] > 0) {
      return address;
    }
  }

  exitProcess(`Unable to select token holder`, 1);
  return null;
}
