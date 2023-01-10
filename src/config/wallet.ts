import { ArweaveClient } from '../clients/arweave';

import { getKeyPairFromMnemonic } from "human-crypto-keys";
import { webcrypto } from 'crypto'
import fs from 'fs';

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
    console.log("\x1b[31m", "\n*** Write the following seed phrase down ***\n");
    console.log("\x1b[32m", mnemonic);
    console.log("\x1b[31m", "\n*** THERE IS NO WAY TO RECOVER YOUR SEED PHRASE SO WRITE IT DOWN AND KEEP IT OUT OF OTHERS HANDS ***\n");
    const keyfile: any = await jwkFromMnemonic(mnemonic);
    const address = await arClient.arweavePost.wallets.jwkToAddress(keyfile);
    let walletFile = "wallets/" + poolArg + "-" + address + ".json";
    fs.writeFileSync(walletFile, JSON.stringify(keyfile));
    console.log("New pool wallet file created: " + walletFile);
    console.log("Wallet Address: " + address);
    console.log("\n");
    let r: WalletReturn = {
        file: walletFile,
        address: address
    };
    return r;
}