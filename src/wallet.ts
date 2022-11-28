import { ArweaveClient } from './gql';
import bip39 from 'bip39-web-crypto'
import { getKeyPairFromMnemonic } from "human-crypto-keys";
import { webcrypto } from 'crypto'
import fs from 'fs';

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

export async function createWallet() {
    const mnemonic = await bip39.generateMnemonic();
    fs.writeFileSync('local/wallets/mnemonic.txt', JSON.stringify(mnemonic))
    const keyfile: any = await jwkFromMnemonic(mnemonic);
    const address = await arClient.arweave.wallets.jwkToAddress(keyfile);
    fs.writeFileSync('local/wallets/wallet.json', JSON.stringify(keyfile))
    const encryptedKeyfile = btoa(JSON.stringify(keyfile));
}