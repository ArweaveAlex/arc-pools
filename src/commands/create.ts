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
import CommandInterface from "../interfaces/command";
import {
    CLI_ARGS,
    NFT_CONTRACT_PATH,
    NFT_JSON_PATH,
    POOL_CONTRACT_PATH,
    TAGS,
    POOL_FILE
} from "../config";

const command: CommandInterface = {
    name: CLI_ARGS.commands.create,
    description: 'Create a pool using pools.json',
    args: ['pool id'],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);

        let poolPath: string = POOL_FILE;

        if(!args.argv["control-wallet"]){
            exitProcess("Control wallet not provided", 1);
        }

        let controlWalletPath: string = args.argv["control-wallet"];

        const POOLS_JSON = JSON.parse(fs.readFileSync(poolPath).toString());
        const poolArg = args.commandValues[0]

        const arClient = new ArweaveClient();

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


            if (args.argv["image"]) {
                const image = fs.readFileSync(args.argv["image"], 'utf8')
                const type = mime.getType(args.argv["image"])

                const tx = await arClient.arweave.createTransaction({
                    data: JSON.stringify(image)
                });
                tx.addTag("Content-Type", type);
                await arClient.arweave.transactions.sign(tx, controlWallet);
                await arClient.arweave.transactions.post(tx);

                POOLS_JSON[poolArg].state.image = tx.id;
            } else {
                POOLS_JSON[poolArg].state.image = "tVIyHNzSut55pGLrWxvD4EQzb526coAeznMcf7GjLEo"
            }
        }
        catch {
            exitProcess(`Invalid Control Wallet / Contract Configuration`, 1);
        }

        console.log(`Deploying NFT Contract Source ...`);
        const nftDeployment = await arClient.warp.createContract.deploy({
            src: nftSrc,
            initState: JSON.stringify(nftInitState),
            wallet: controlWallet
        }, true);
        const nftDeploymentSrc = (await axios.get(contractEndpoint(nftDeployment.contractTxId))).data.srcTxId;

        POOLS_JSON[poolArg].contracts.nft.id = nftDeployment;
        POOLS_JSON[poolArg].contracts.nft.src = nftDeploymentSrc;
        fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.nft.id - [`, clc.green(`'${nftDeployment}'`), `]`);
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.nft.src - [`, clc.green(`'${nftDeploymentSrc}'`), `]`);

        const signer = new ArweaveSigner(controlWallet);

        console.log(`Deploying Pool Contract Source ...`);
        const poolSrcDeployment = await arClient.sourceImpl.save({ src: poolSrc }, "mainnet", controlWallet);

        POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.id;
        fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.pool.src - [`, clc.green(`'${poolSrcDeployment.id}'`), `]`);

        const timestamp = Date.now().toString();

        POOLS_JSON[poolArg].state.timestamp = timestamp;
        fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - state.timestamp - `, clc.green(`'${timestamp}'`));

        const poolInitJson: PoolStateType = {
            title: poolConfig.state.title,
            image: POOLS_JSON[poolArg].state.image,
            briefDescription: poolConfig.state.briefDescription,
            description: poolConfig.state.description,
            link: poolConfig.state.image,
            owner: poolConfig.state.owner.pubkey,
            ownerInfo: poolConfig.state.owner.info,
            timestamp: timestamp,
            contributors: {},
            tokens: {},
            totalContributions: "0",
            totalSupply: "0"
        }

        const tags = [
            { "name": TAGS.keys.appType, "value": poolConfig.appType },
            { "name": TAGS.keys.poolName, "value": poolConfig.state.title }
        ]

        console.log(`Deploying Pool from Source Tx ...`);
        const poolInitState = JSON.stringify(poolInitJson, null, 2);
        const poolDeployment = await arClient.warp.createContract.deployFromSourceTx({
            wallet: controlWallet,
            initState: poolInitState,
            srcTxId: poolSrcDeployment.id,
            tags: tags
        });

        POOLS_JSON[poolArg].contracts.pool.id = poolDeployment;
        fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.pool.id - [`, clc.green(`'${poolDeployment}'`), `]`);
    }
}

export default command;