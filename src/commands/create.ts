import fs from "fs";
import axios from "axios";
import clc from "cli-color";

import { ArweaveClient } from "../gql";
import { exitProcess } from "../utils";
import { PoolType, PoolStateType, PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { contractEndpoint } from "../endpoints";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import {
    CLI_ARGS,
    POOLS_PATH,
    CONTROL_WALLET_PATH,
    NFT_CONTRACT_PATH,
    NFT_JSON_PATH,
    POOL_CONTRACT_PATH,
    TAGS
} from "../config";

const command: CommandInterface = {
    name: CLI_ARGS.commands.create,
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        
        const POOLS_JSON = JSON.parse(fs.readFileSync(POOLS_PATH).toString());
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
            controlWallet = JSON.parse(fs.readFileSync(CONTROL_WALLET_PATH).toString());
            nftSrc = fs.readFileSync(NFT_CONTRACT_PATH, "utf8");
            nftInitState = JSON.parse(fs.readFileSync(NFT_JSON_PATH, "utf8"));
            poolSrc = fs.readFileSync(POOL_CONTRACT_PATH, "utf8");
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
        const nftDeploymentSrc = (await axios.get(contractEndpoint(nftDeployment))).data.srcTxId;

        POOLS_JSON[poolArg].contracts.nft.id = nftDeployment;
        POOLS_JSON[poolArg].contracts.nft.src = nftDeploymentSrc;
        fs.writeFileSync(POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.nft.id - [`, clc.green(`'${nftDeployment}'`), `]`);
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.nft.src - [`, clc.green(`'${nftDeploymentSrc}'`), `]`);

        console.log(`Deploying Pool Contract Source ...`);
        const poolSrcDeployment = await arClient.sourceImpl.save({ src: poolSrc }, controlWallet);

        POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.id;
        fs.writeFileSync(POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.pool.src - [`, clc.green(`'${poolSrcDeployment.id}'`), `]`);

        const timestamp = Date.now().toString();

        POOLS_JSON[poolArg].state.timestamp = timestamp;
        fs.writeFileSync(POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - state.timestamp - `, clc.green(`'${timestamp}'`));

        const poolInitJson: PoolStateType = {
            title: poolConfig.state.title,
            image: poolConfig.state.image,
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
        fs.writeFileSync(POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.pool.id - [`, clc.green(`'${poolDeployment}'`), `]`);
    }
}

export default command;