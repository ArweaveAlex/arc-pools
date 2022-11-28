import fs from "fs";
import axios from "axios";
import clc from "cli-color";
import { ArweaveSigner } from 'arbundles/src/signing';
import mime from 'mime';

import { ArweaveClient } from "../gql";
import { exitProcess } from "../utils";
import { PoolType, PoolStateType, PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { contractEndpoint } from "../endpoints";
import { ArgumentsInterface } from "../interfaces";
import { createWallet, WalletReturn } from "../wallet"
import CommandInterface from "../interfaces/command";
import {
    CLI_ARGS,
    NFT_CONTRACT_PATH,
    NFT_JSON_PATH,
    POOL_CONTRACT_PATH,
    TAGS,
    POOL_FILE
} from "../config";
import path from "path";

const command: CommandInterface = {
    name: CLI_ARGS.commands.create,
    description: 'Create a pool using pools.json',
    args: ['pool id'],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);

        let poolPath: string = POOL_FILE;

        let controlWalletPath: string = args.argv["control-wallet"];

        // POOLS_JSON will be mutated and saved by this program
        const POOLS_JSON = JSON.parse(fs.readFileSync(poolPath).toString());

        // the pool name
        const poolArg = args.commandValues[0];

        // generate a wallet file save it to file system
        // then update the pool config to have the wallet info
        let walletInfo  = await createWallet(poolArg);
        POOLS_JSON[poolArg].state.owner.pubkey = walletInfo.address;
        POOLS_JSON[poolArg].walletPath = walletInfo.file;

        const arClient = new ArweaveClient();

        // make sure this pool name doesn't exist on chain
        const exisitingPools = await arClient.getAllPools();
        exisitingPools.forEach(function (pool: PoolType) {
            if (poolConfig.state.title === pool.state.title) {
                exitProcess(`Pool Already Exists`, 1);
            }
        });

        let controlWallet: any;
        let nftSrc: any;
        let nftInitState: any;
        let poolSrc: any;

        try {
            controlWallet = JSON.parse(fs.readFileSync(controlWalletPath).toString());
            nftSrc = fs.readFileSync(NFT_CONTRACT_PATH, "utf8");
            nftInitState = JSON.parse(fs.readFileSync(NFT_JSON_PATH, "utf8"));
            poolSrc = fs.readFileSync(POOL_CONTRACT_PATH, "utf8");


            // upload an image from the argument if provided if not use default
            if (args.argv["image"]) {
                if(!fs.existsSync(args.argv["image"])){
                    exitProcess(`Image file does not exist`, 1);
                }
                const image = await fs.promises.readFile(path.resolve(args.argv["image"]));
                const type = mime.getType(args.argv["image"]);
                const tx = await arClient.arweave.createTransaction({
                    data: image
                });
                tx.addTag("Content-Type", type);
                await arClient.arweave.transactions.sign(tx, controlWallet);
                await arClient.arweave.transactions.post(tx);
                console.log("Pool image posted, arweave tx id: " + tx.id);
                POOLS_JSON[poolArg].state.image = tx.id;
            } else {
                POOLS_JSON[poolArg].state.image = "8HqSqy_nNRSTPv-q-j7_iHGTp6lEA5K77TP4BPuXGyA"
            }
        }
        catch {
            exitProcess(`Invalid Control Wallet / Contract Configuration`, 1);
        }

        // upload contract source code for the pool then modify
        // the pool config to contain the id for the source
        console.log(`Deploying NFT Contract Source ...`);
        let nftDeployment;
        let nftDeploymentSrc;

        try{
            nftDeployment = await arClient.warp.createContract.deploy({
                src: nftSrc,
                initState: JSON.stringify(nftInitState),
                wallet: controlWallet
            }, true);
        } catch (e: any) {
            exitProcess("Failed deploying nftContractSrc to warp", 1);
        }

        POOLS_JSON[poolArg].contracts.nft.id = nftDeployment.contractTxId;
        POOLS_JSON[poolArg].contracts.nft.src = nftDeployment.srcTxId;

        console.log(`Deploying Pool Contract Source ...`);
        console.log(typeof poolSrc);
        const poolSrcDeployment = await arClient.warp.createContract.deploy({
            src: poolSrc,
            initState: JSON.stringify({}),
            wallet: controlWallet
        }, true);

        POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.srcTxId;
        const timestamp = Date.now().toString();
        POOLS_JSON[poolArg].state.timestamp = timestamp;

        // initialize the state of the pool then send it to warp
        const poolInitJson: PoolStateType = {
            title: poolConfig.state.title,
            image: POOLS_JSON[poolArg].state.image,
            briefDescription: poolConfig.state.briefDescription,
            description: poolConfig.state.description,
            link: POOLS_JSON[poolArg].state.image,
            owner: POOLS_JSON[poolArg].state.owner.pubkey,
            ownerInfo: poolConfig.state.owner.info,
            timestamp: timestamp,
            contributors: {},
            tokens: {},
            totalContributions: "0",
            totalSupply: "0"
        }

        console.log(poolInitJson);

        const tags = [
            { "name": TAGS.keys.appType, "value": poolConfig.appType },
            { "name": TAGS.keys.poolName, "value": poolConfig.state.title }
        ]

        console.log(`Deploying Pool from Source Tx ...`);
        const poolInitState = JSON.stringify(poolInitJson, null, 2);
        const poolDeployment = await arClient.warp.createContract.deployFromSourceTx({
            wallet: controlWallet,
            initState: poolInitState,
            srcTxId: poolSrcDeployment.srcTxId,
            tags: tags
        });

        POOLS_JSON[poolArg].contracts.pool.id = poolDeployment.contractTxId;

        // save the pool file with all the new data
        fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));

        console.log("Your pool has been deployed please wait for the pool to display correctly from the below link before proceeding...");
        console.log("https://sonar.warp.cc/#/app/contract/" + poolDeployment.contractTxId);
    }
}

export default command;