import { webcrypto } from 'crypto';
import fs from 'fs';
import { getKeyPairFromMnemonic } from 'human-crypto-keys';

const bip39 = require('bip39-web-crypto');

import { ArweaveClient } from 'arcframework';

import { log, logValue } from './utils';

const arClient = new ArweaveClient();

async function jwkFromMnemonic(mnemonic: string) {
	const { privateKey }: any = await getKeyPairFromMnemonic(
		mnemonic,
		{
			id: 'rsa',
			modulusLength: 4096,
		},
		{ privateKeyFormat: 'pkcs8-der' }
	);
	const jwk: Promise<object> = pkcs8ToJwk(privateKey);

	return jwk;
}

async function pkcs8ToJwk(privateKey: any) {
	const key = await webcrypto.subtle.importKey('pkcs8', privateKey, { name: 'RSA-PSS', hash: 'SHA-256' }, true, [
		'sign',
	]);
	const jwk = await webcrypto.subtle.exportKey('jwk', key);

	return {
		kty: jwk.kty,
		e: jwk.e,
		n: jwk.n,
		d: jwk.d,
		p: jwk.p,
		q: jwk.q,
		dp: jwk.dp,
		dq: jwk.dq,
		qi: jwk.qi,
	};
}

export type WalletReturn = {
	file: string;
	address: string;
};

export async function createWallet(poolArg: string) {
	log('Generating wallet ...', null);

	if (!fs.existsSync('wallets')) {
		fs.mkdirSync('wallets');
	}

	const mnemonic = await bip39.generateMnemonic();
	log(`Write down the following seed phrase, this phrase is not recoverable !`, null);
	logValue('Seedphrase', `${mnemonic}`, 0);

	log('Generating keyfile ...', null);
	const keyfile: any = await jwkFromMnemonic(mnemonic);
	log('Fetching address ...', null);
	const address = await arClient.arweavePost.wallets.jwkToAddress(keyfile);
	const walletFile = `wallets/${poolArg}-${address}.json`;

	fs.writeFileSync(walletFile, JSON.stringify(keyfile));
	console.log(`Wallet file created: ${walletFile}`);
	console.log(`Wallet address: ${address}`);

	return {
		file: walletFile,
		address: address,
		keys: keyfile,
	};
}
