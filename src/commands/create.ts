import fs from "fs";
import clc from "cli-color";
import mime from 'mime';
import path from "path";

const readline = require('readline');

import Bundlr from "@bundlr-network/client";

import { ArweaveClient } from "../clients/arweave";
import { getPools } from "../gql/pools";
import { exitProcess, logJsonUpdate } from "../helpers/utils";
import { PoolType, PoolStateType, PoolConfigType, ANSTopicEnum, ArtifactEnum } from "../helpers/types";
import { validatePoolConfig, validateControlWalletPath } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { createWallet } from "../helpers/wallet";
import { sonarLink } from "../helpers/endpoints";
import {
    CLI_ARGS,
    NFT_CONTRACT_PATH,
    NFT_JSON_PATH,
    POOL_CONTRACT_PATH,
    TAGS,
    POOL_FILE,
    FALLBACK_IMAGE
} from "../helpers/config";
import { ArweaveSigner } from "warp-contracts-plugin-deploy";

const command: CommandInterface = {
    name: CLI_ARGS.commands.create,
    description: `Create a pool using ${POOL_FILE}`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        const poolPath: string = POOL_FILE;
        
        const controlWalletPath: string = validateControlWalletPath(args.argv["control-wallet"]);
        
        const POOLS_JSON = JSON.parse(fs.readFileSync(poolPath).toString());
        
        const poolArg = args.commandValues[0];

        console.log(`Checking Exisiting Pools ...`);
        const exisitingPools = await getPools();
        exisitingPools.forEach(function (pool: PoolType) {
            if (poolConfig.state.title === pool.state.title) {
                exitProcess(`Pool Already Exists`, 1);
            }
        });

        let validTopic = false;
        poolConfig.topics.map((topic: string) => {
            if(topic in ANSTopicEnum){
                validTopic = true;
            } 
        });

        let topics = Object.values(ANSTopicEnum).join(', ');
        if(!validTopic){
            exitProcess(`Must configure at least 1 topic in pools.json with one of the following values ${topics}`, 1);
        }
        
        const walletInfo = await createWallet(poolArg);

        POOLS_JSON[poolArg].state.owner.pubkey = walletInfo.address;
        POOLS_JSON[poolArg].walletPath = walletInfo.file;
        
        logJsonUpdate(poolConfig.state.title, `state.owner.pubkey`, walletInfo.address);
        logJsonUpdate(poolConfig.state.title, `walletPath`, walletInfo.file);

        const arClient = new ArweaveClient();

        let controlWalletJwk: any;
        let nftSrc: any;
        let nftInitState: any;
        let poolSrc: any;
        let nftDeployment: any;
        let controlWalletAddress: string;

        try {
            controlWalletJwk = JSON.parse(fs.readFileSync(controlWalletPath).toString());
            controlWalletAddress = await arClient.arweavePost.wallets.jwkToAddress(controlWalletJwk);
            POOLS_JSON[poolArg].state.controller.pubkey = controlWalletAddress;
            
            let controlWalletBalance  = await arClient.arweavePost.wallets.getBalance(controlWalletAddress);
            if(controlWalletBalance == 0) {
                exitProcess(`Control wallet is empty`, 1);
            }


            nftSrc = fs.readFileSync(NFT_CONTRACT_PATH, "utf8");
            nftInitState = JSON.parse(fs.readFileSync(NFT_JSON_PATH, "utf8"));
            poolSrc = fs.readFileSync(POOL_CONTRACT_PATH, "utf8");
            
            if (args.argv["image"]) {
                if (!fs.existsSync(args.argv["image"])) {
                    exitProcess(`Image file does not exist`, 1);
                }
                const image = await fs.promises.readFile(path.resolve(args.argv["image"]));
                const type = mime.getType(args.argv["image"]);
                const tx = await arClient.arweavePost.createTransaction({
                    data: image
                });
                tx.addTag(TAGS.keys.contentType, type);
                await arClient.arweavePost.transactions.sign(tx, controlWalletJwk);
                await arClient.arweavePost.transactions.post(tx);
                console.log(`Pool image posted, Arweave Tx Id - [`, clc.green(`'${tx.id}'`), `]`);
                POOLS_JSON[poolArg].state.image = tx.id;
                logJsonUpdate(poolConfig.state.title, `state.image`, tx.id);
            } 
            else {
                POOLS_JSON[poolArg].state.image = FALLBACK_IMAGE;
                logJsonUpdate(poolConfig.state.title, `state.image`, FALLBACK_IMAGE);
            }
        }
        catch {
            exitProcess(`Invalid Control Wallet / Contract Configuration`, 1);
        }
        
        console.log(`Deploying NFT Contract Source ...`);

        try {
            nftDeployment = await arClient.warp.createContract.deploy({
                src: nftSrc,
                initState: JSON.stringify(nftInitState),
                wallet: new ArweaveSigner(controlWalletJwk)
            });
        } catch (e: any) {
            console.log(e);
            exitProcess(`Failed deploying nftContractSrc to warp`, 1);
        }

        POOLS_JSON[poolArg].contracts.nft.id = nftDeployment.contractTxId;
        POOLS_JSON[poolArg].contracts.nft.src = nftDeployment.srcTxId;
        logJsonUpdate(poolConfig.state.title, `contracts.nft.id`, nftDeployment.contractTxId);
        logJsonUpdate(poolConfig.state.title, `contracts.nft.src`, nftDeployment.srcTxId);

        console.log(`Deploying Pool Contract Source ...`);
        const poolSrcDeployment = await arClient.warp.createContract.deploy({
            src: poolSrc,
            initState: JSON.stringify({}),
            wallet: new ArweaveSigner(controlWalletJwk)
        });

        POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.srcTxId;
        logJsonUpdate(poolConfig.state.title, `contracts.pool.src`, poolSrcDeployment.contractTxId);
        
        const timestamp = Date.now().toString();
        POOLS_JSON[poolArg].state.timestamp = timestamp;
        logJsonUpdate(poolConfig.state.title, `state.timestamp`, timestamp);
        
        const poolInitJson: PoolStateType = {
            title: poolConfig.state.title,
            image: POOLS_JSON[poolArg].state.image,
            briefDescription: poolConfig.state.briefDescription,
            description: poolConfig.state.description,
            owner: POOLS_JSON[poolArg].state.owner.pubkey,
            ownerInfo: poolConfig.state.owner.info,
            timestamp: timestamp,
            contributors: {},
            tokens: {},
            totalContributions: "0",
            totalSupply: "10000000",
            balance: "0",
            canEvolve: true,
            controlPubkey: controlWalletAddress,
            contribPercent: POOLS_JSON[poolArg].state.controller.contribPercent
        };

        const tags = [
            { "name": TAGS.keys.appType, "value": poolConfig.appType },
            { "name": TAGS.keys.poolName, "value": poolConfig.state.title },
            // ANS 110 tags
            { "name": TAGS.keys.title, "value": poolConfig.state.title },
            { "name": TAGS.keys.type, "value": TAGS.values.ansTypes.collection },
            { "name": TAGS.keys.description, "value": poolConfig.state.briefDescription }
        ];

        poolConfig.topics.map((topic: string) => {
            if(topic in ANSTopicEnum){
                tags.push(
                    { "name": TAGS.keys.topic(topic), "value": topic},
                );
            } else {
                console.log(`Invalid ANS topic skipping ${topic}`);
            }
        });

        console.log(`Deploying Pool from Source Tx ...`);
        const poolInitState = JSON.stringify(poolInitJson, null, 2);
        const poolDeployment = await arClient.warp.createContract.deployFromSourceTx({
            wallet: new ArweaveSigner(controlWalletJwk),
            initState: poolInitState,
            srcTxId: poolSrcDeployment.srcTxId,
            tags: tags
        });

        POOLS_JSON[poolArg].contracts.pool.id = poolDeployment.contractTxId;
        logJsonUpdate(poolConfig.state.title, `contracts.pool.id`, poolDeployment.contractTxId);
        
        fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Pool File Updated`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Would you like to contribute to your pool from your control wallet to begin mining sooner? (y/n) ', async (answer: string) => {
            if (answer.toLowerCase() === 'y') {
                const controlWalletAddress = await arClient.arweavePost.wallets.jwkToAddress(controlWalletJwk);
                let controlWalletBalance  = await arClient.arweavePost.wallets.getBalance(controlWalletAddress);

                let arBalance = arClient.arweavePost.ar.winstonToAr(controlWalletBalance);

                askForBalance(arBalance, arClient, poolDeployment, walletInfo, rl, controlWalletJwk, poolConfig); 
            } else {
                finishOut(poolDeployment, rl);
            }
        });
    }
}

function askForBalance(
    arBalance: number, 
    arClient: ArweaveClient, 
    poolDeployment: any, 
    walletInfo: {
        file: string;
        address: any;
    },
    rl: any,
    controlWalletJwk: any,
    poolConfig: PoolConfigType
) {
    
    rl.question(`How much would you like to contribute. You have ${arBalance} ar to contribute, enter a decimal amount greater than 0.01: `, async (amount: string) => {
        const am = parseFloat(amount);
        if (isNaN(am) || (am <= 0) || (am > arBalance) || (am < 0.01)) {
            console.log('Invalid input. Please enter a valid positive number greater than 0.01');
            askForBalance(arBalance, arClient, poolDeployment, walletInfo, rl, controlWalletJwk, poolConfig); 
        } else {
            const warpContract = arClient.warp.contract(poolDeployment.contractTxId).connect(
                controlWalletJwk
            ).setEvaluationOptions({
                waitForConfirmation: false,
            });

            let response = await warpContract.writeInteraction(
                { function: 'contribute' },
                {
                    disableBundling: true,
                    transfer: {
                        target: walletInfo.address,
                        winstonQty: arClient.arweavePost.ar.arToWinston(amount),
                    },
                }
            );
            
            if(!response) {
                console.log("Contribution failed, please contribute via the Alex site ...");
                finishOut(poolDeployment, rl);
                return;
            }
            
            console.log("Waiting for contribution funds to come through to send them to Bundlr, this will take a while...")
            do {
                let poolBalance  = await arClient.arweavePost.wallets.getBalance(walletInfo.address);
                if(poolBalance > 0) {
                    await new Promise(resolve => setTimeout(resolve, 120000));
                    let keys = JSON.parse(fs.readFileSync(walletInfo.file).toString());
                    let bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", keys);
                    try {
                        console.log("Attempting Bundlr fund...");
                        await bundlr.fund(Math.floor(poolBalance/2));  
                        console.log("Bundlr funded...");
                        break;
                    } catch(e: any) {
                        console.log("Retrying Bundlr...");
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 60000));
            } while(true);

            console.log("Your funds have been contributed...");
            finishOut(poolDeployment, rl);
        }
    });
}

function finishOut(poolDeployment: any, rl: any) {
    console.log(`Your pool has been deployed, please wait for the pool to display correctly from the below link before proceeding...`);
    console.log(clc.magenta(sonarLink(poolDeployment.contractTxId)));
    rl.close();
}

export default command;