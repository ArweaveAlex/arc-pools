import fs from "fs";
import clc from "cli-color";
import mime from 'mime';
import path from "path";

import { ArweaveClient } from "../clients/arweave";
import { getPools } from "../gql/pools";
import { exitProcess, displayJsonUpdate } from "../helpers/utils";
import { PoolType, PoolStateType, PoolConfigType } from "../helpers/types";
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
        console.log(`Pool JSON Key ${poolArg}`);
        
        console.log(`Generating Wallet ...`)
        let walletInfo = await createWallet(poolArg);
        POOLS_JSON[poolArg].state.owner.pubkey = walletInfo.address;
        POOLS_JSON[poolArg].walletPath = walletInfo.file;
        displayJsonUpdate(poolConfig.state.title, `state.owner.pubkey`, walletInfo.address);
        displayJsonUpdate(poolConfig.state.title, `walletPath`, walletInfo.file);

        const arClient = new ArweaveClient();
        
        console.log(`Checking Exisiting Pools ...`);
        const exisitingPools = await getPools();
        exisitingPools.forEach(function (pool: PoolType) {
            if (poolConfig.state.title === pool.state.title) {
                exitProcess(`Pool Already Exists`, 1);
            }
        });

        let controlWallet: any;
        let nftSrc: any;
        let nftInitState: any;
        let poolSrc: any;
        let nftDeployment: any;

        try {
            controlWallet = JSON.parse(fs.readFileSync(controlWalletPath).toString());
            const controlWalletAddress = await arClient.arweavePost.wallets.jwkToAddress(controlWallet);
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
                await arClient.arweavePost.transactions.sign(tx, controlWallet);
                await arClient.arweavePost.transactions.post(tx);
                console.log(`Pool image posted, Arweave Tx Id - [`, clc.green(`'${tx.id}'`), `]`);
                POOLS_JSON[poolArg].state.image = tx.id;
                displayJsonUpdate(poolConfig.state.title, `state.image`, tx.id);
            } 
            else {
                POOLS_JSON[poolArg].state.image = FALLBACK_IMAGE;
                displayJsonUpdate(poolConfig.state.title, `state.image`, FALLBACK_IMAGE);
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
                wallet: controlWallet
            });
        } catch (e: any) {
            exitProcess(`Failed deploying nftContractSrc to warp`, 1);
        }

        POOLS_JSON[poolArg].contracts.nft.id = nftDeployment.contractTxId;
        POOLS_JSON[poolArg].contracts.nft.src = nftDeployment.srcTxId;
        displayJsonUpdate(poolConfig.state.title, `contracts.nft.id`, nftDeployment.contractTxId);
        displayJsonUpdate(poolConfig.state.title, `contracts.nft.src`, nftDeployment.srcTxId);

        console.log(`Deploying Pool Contract Source ...`);
        const poolSrcDeployment = await arClient.warp.createContract.deploy({
            src: poolSrc,
            initState: JSON.stringify({}),
            wallet: controlWallet
        });

        POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.srcTxId;
        displayJsonUpdate(poolConfig.state.title, `contracts.pool.src`, poolSrcDeployment.contractTxId);
        
        const timestamp = Date.now().toString();
        POOLS_JSON[poolArg].state.timestamp = timestamp;
        displayJsonUpdate(poolConfig.state.title, `state.timestamp`, timestamp);
        
        const poolInitJson: PoolStateType = {
            title: poolConfig.state.title,
            image: POOLS_JSON[poolArg].state.image,
            briefDescription: poolConfig.state.briefDescription,
            description: poolConfig.state.description,
            link: "",
            owner: POOLS_JSON[poolArg].state.owner.pubkey,
            ownerInfo: poolConfig.state.owner.info,
            timestamp: timestamp,
            contributors: {},
            tokens: {},
            totalContributions: "0",
            totalSupply: "10000000",
            balance: "0",
            canEvolve: true
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
            srcTxId: poolSrcDeployment.srcTxId,
            tags: tags
        });

        POOLS_JSON[poolArg].contracts.pool.id = poolDeployment.contractTxId;
        displayJsonUpdate(poolConfig.state.title, `contracts.pool.id`, poolDeployment.contractTxId);
        
        fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Pool File Updated`);

        console.log(`Your pool has been deployed, please wait for the pool to display correctly from the below link before proceeding...`);
        console.log(clc.magenta(sonarLink(poolDeployment.contractTxId)));
    }
}

export default command;