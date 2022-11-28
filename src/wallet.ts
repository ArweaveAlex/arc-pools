import { ArweaveClient } from './gql';

import { getKeyPairFromMnemonic } from "human-crypto-keys";
import { webcrypto } from 'crypto'
import fs from 'fs';
import path from 'path';

const bip39 = require('bip39-web-crypto');

const arClient = new ArweaveClient();

async function jwkFromMnemonic(mnemonic: string) {
    const { privateKey }: any = await getKeyPairFromMnemonic(
        mnemonic,
        {
            id: "rsa",
            modulusLength: 4096
        },
        { privateKeyFormat: "pkcs8-der" }
    );
    const jwk: Promise<object> = pkcs8ToJwk(privateKey);

    return jwk;
}

async function pkcs8ToJwk(privateKey: any) {
    const key = await webcrypto.subtle.importKey(
        "pkcs8",
        privateKey,
        { name: "RSA-PSS", hash: "SHA-256" },
        true,
        ["sign"]
    );
    const jwk = await webcrypto.subtle.exportKey("jwk", key);

    return {
        kty: jwk.kty,
        e: jwk.e,
        n: jwk.n,
        d: jwk.d,
        p: jwk.p,
        q: jwk.q,
        dp: jwk.dp,
        dq: jwk.dq,
        qi: jwk.qi
    };
}

export type WalletReturn = {
    file: string;
    address: string;
}

export async function createWallet(poolArg: string) {
    if (!fs.existsSync('wallets')) {
        fs.mkdirSync('wallets');
    }

    const mnemonic = await bip39.generateMnemonic();
    let mnemonicFile = path.join("", "wallets/" + poolArg + "-mnemonic.txt");
    fs.writeFileSync(mnemonicFile, JSON.stringify(mnemonic));
    const keyfile: any = await jwkFromMnemonic(mnemonic);
    const address = await arClient.arweave.wallets.jwkToAddress(keyfile);
    let walletFile = path.join("", "wallets/" + poolArg + "-" + address + ".json");
    fs.writeFileSync(walletFile, JSON.stringify(keyfile));
    console.log("New pool wallet file created: " + walletFile);
    console.log("Wallet Address: " + address);
    const encryptedKeyfile = btoa(JSON.stringify(keyfile));
    let r: WalletReturn = {
        file: walletFile,
        address: address
    };
    return r;
}