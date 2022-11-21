import fs from "fs";
import clc from "cli-color";
import axios from "axios";

import { ArweaveClient } from "../gql";
import { exitProcess } from "../utils";
import { PoolType, PoolStateType, PoolConfigType } from "../types";
import { validatePool } from "../validations";
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
    name: CLI_ARGS.create,
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolArg = args.commandValues[0];
        const POOLS_JSON = JSON.parse(fs.readFileSync(POOLS_PATH).toString());

        if (!args.commandValues || !args.commandValues.length) {
            exitProcess(`Pool Not Provided`);
        }

        if (!(poolArg in POOLS_JSON)) {
            exitProcess(`Pool Not Found`);
        }

        const validatedPool: PoolConfigType | null = validatePool(POOLS_JSON[poolArg]);

        if (!validatedPool) {
            exitProcess(`Invalid Pool Configuration`);
        }

        const arClient = new ArweaveClient();

        const exisitingPools = await arClient.getAllPools();
        exisitingPools.forEach(function (pool: PoolType) {
            if (validatedPool.state.title === pool.state.title) {
                exitProcess(`Pool Already Exists`);
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
            exitProcess(`Invalid Wallet / Contract Configuration`);
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
        console.log(`Updated ${poolArg} JSON Object - contracts.nft.id - [`, clc.green(`'${nftDeployment}'`), `]`);
        console.log(`Updated ${poolArg} JSON Object - contracts.nft.src - [`, clc.green(`'${nftDeploymentSrc}'`), `]`);

        console.log(`Deploying Pool Contract Source ...`);
        const poolSrcDeployment = await arClient.sourceImpl.save({ src: poolSrc }, controlWallet);

        POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.id;
        fs.writeFileSync(POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolArg} JSON Object - contracts.pool.src - [`, clc.green(`'${poolSrcDeployment.id}'`), `]`);

        const timestamp = Date.now().toString();

        POOLS_JSON[poolArg].state.timestamp = timestamp;
        fs.writeFileSync(POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolArg} JSON Object - state.timestamp - `, clc.green(`'${timestamp}'`));

        const poolInitJson: PoolStateType = {
            title: POOLS_JSON[poolArg].state.title,
            image: POOLS_JSON[poolArg].state.image,
            briefDescription: POOLS_JSON[poolArg].state.briefDescription,
            description: POOLS_JSON[poolArg].state.description,
            link: POOLS_JSON[poolArg].state.image,
            owner: POOLS_JSON[poolArg].state.owner.pubkey,
            ownerInfo: POOLS_JSON[poolArg].state.owner.info,
            timestamp: timestamp,
            contributors: {},
            tokens: {},
            totalContributions: "0",
            totalSupply: "0"
        }

        const tags = [
            { "name": TAGS.keys.appType, "value": POOLS_JSON[poolArg].appType },
            { "name": TAGS.keys.poolName, "value": POOLS_JSON[poolArg].state.title }
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
        console.log(`Updated ${poolArg} JSON Object - contracts.pool.id - [`, clc.green(`'${poolDeployment}'`), `]`);
    }
}

export default command;