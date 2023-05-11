"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNewPoolConfig = void 0;
const warp_contracts_plugin_deploy_1 = require("warp-contracts-plugin-deploy");
const helpers_1 = require("../../helpers");
const PoolClient_1 = __importDefault(require("./PoolClient"));
const contracts_1 = require("./contracts/contracts");
function initNewPoolConfig() {
    return helpers_1.DEFAULT_POOLS_JSON;
}
exports.initNewPoolConfig = initNewPoolConfig;
class PoolCreateClient {
    constructor(poolConfig, controlWalletJwk, poolWalletJwk, poolWalletPath, img, imgFileType) {
        this.poolClient = new PoolClient_1.default(poolConfig);
        this.poolConfig = poolConfig;
        this.controlWalletJwk = controlWalletJwk;
        this.poolWalletJwk = poolWalletJwk;
        this.poolWalletPath = poolWalletPath;
        this.img = img;
        this.imgFileType = imgFileType;
        this.createPool = this.createPool.bind(this);
    }
    async createPool() {
        let nftSrc = contracts_1.NFT_CONTRACT_SRC;
        let nftInitState = contracts_1.NFT_INIT_STATE;
        let poolSrc = contracts_1.POOL_CONTRACT_SRC;
        let nftDeployment;
        let controlWalletAddress;
        let img;
        try {
            controlWalletAddress = await this.poolClient.arweavePost.wallets.jwkToAddress(this.controlWalletJwk);
            let controlWalletBalance = await this.poolClient.arweavePost.wallets.getBalance(controlWalletAddress);
            if (controlWalletBalance == 0) {
                throw new Error(`Control wallet is empty`);
            }
            if (this.img) {
                const tx = await this.poolClient.arweavePost.createTransaction({
                    data: this.img
                });
                tx.addTag(helpers_1.TAGS.keys.contentType, this.imgFileType);
                await this.poolClient.arweavePost.transactions.sign(tx, this.controlWalletJwk);
                await this.poolClient.arweavePost.transactions.post(tx);
                img = tx.id;
            }
            else {
                img = helpers_1.FALLBACK_IMAGE;
            }
        }
        catch (e) {
            throw new Error(`Failed to upload background image`);
        }
        try {
            nftDeployment = await this.poolClient.warp.createContract.deploy({
                src: nftSrc,
                initState: JSON.stringify(nftInitState),
                wallet: new warp_contracts_plugin_deploy_1.ArweaveSigner(this.controlWalletJwk)
            });
        }
        catch (e) {
            console.log(e);
            throw new Error(`Failed deploying nftContractSrc to warp`);
        }
        try {
            console.log(`Deploying Pool Contract Source ...`);
            const poolSrcDeployment = await this.poolClient.warp.createContract.deploy({
                src: poolSrc,
                initState: JSON.stringify({}),
                wallet: new warp_contracts_plugin_deploy_1.ArweaveSigner(this.controlWalletJwk)
            });
            const timestamp = Date.now().toString();
            const poolInitJson = {
                title: this.poolConfig.state.title,
                image: img,
                briefDescription: this.poolConfig.state.briefDescription,
                description: this.poolConfig.state.description,
                owner: this.poolWalletJwk,
                ownerInfo: this.poolConfig.state.owner.info,
                timestamp: timestamp,
                contributors: {},
                tokens: {},
                totalContributions: "0",
                totalSupply: "10000000",
                balance: "0",
                canEvolve: true,
                controlPubkey: controlWalletAddress,
                contribPercent: this.poolConfig.state.controller.contribPercent.toString(),
                topics: []
            };
            const tags = [
                { "name": helpers_1.TAGS.keys.appType, "value": this.poolConfig.appType },
                { "name": helpers_1.TAGS.keys.poolName, "value": this.poolConfig.state.title },
                // ANS 110 tags
                { "name": helpers_1.TAGS.keys.title, "value": this.poolConfig.state.title },
                { "name": helpers_1.TAGS.keys.type, "value": helpers_1.TAGS.values.ansTypes.collection },
                { "name": helpers_1.TAGS.keys.description, "value": this.poolConfig.state.briefDescription }
            ];
            this.poolConfig.topics.map((topic) => {
                if (topic in helpers_1.ANSTopicEnum) {
                    tags.push({ "name": helpers_1.TAGS.keys.topic(topic), "value": topic });
                    poolInitJson.topics.push(topic);
                }
                else {
                    console.log(`Invalid ANS topic skipping ${topic}`);
                }
            });
            console.log(`Deploying Pool from Source Tx ...`);
            const poolInitState = JSON.stringify(poolInitJson, null, 2);
            const poolDeployment = await this.poolClient.warp.createContract.deployFromSourceTx({
                wallet: new warp_contracts_plugin_deploy_1.ArweaveSigner(this.controlWalletJwk),
                initState: poolInitState,
                srcTxId: poolSrcDeployment.srcTxId,
                tags: tags
            });
            let poolWalletAddress = await this.poolClient.arweavePost.wallets.jwkToAddress(this.poolWalletJwk);
            this.poolConfig.state.owner.pubkey = poolWalletAddress;
            this.poolConfig.walletPath = this.poolWalletPath;
            this.poolConfig.state.controller.pubkey = controlWalletAddress;
            this.poolConfig.state.image = img;
            this.poolConfig.contracts.pool.src = poolSrcDeployment.srcTxId;
            this.poolConfig.state.timestamp = timestamp;
            this.poolConfig.contracts.nft.id = nftDeployment.contractTxId;
            this.poolConfig.contracts.nft.src = nftDeployment.srcTxId;
            this.poolConfig.contracts.pool.id = poolDeployment.contractTxId;
            (0, helpers_1.logJsonUpdate)(this.poolConfig.state.title, `contracts.nft.id`, nftDeployment.contractTxId);
            (0, helpers_1.logJsonUpdate)(this.poolConfig.state.title, `contracts.nft.src`, nftDeployment.srcTxId);
            (0, helpers_1.logJsonUpdate)(this.poolConfig.state.title, `state.timestamp`, timestamp);
            (0, helpers_1.logJsonUpdate)(this.poolConfig.state.title, `contracts.pool.src`, poolSrcDeployment.contractTxId);
            (0, helpers_1.logJsonUpdate)(this.poolConfig.state.title, `state.owner.pubkey`, poolWalletAddress);
            (0, helpers_1.logJsonUpdate)(this.poolConfig.state.title, `walletPath`, this.poolWalletPath);
            (0, helpers_1.logJsonUpdate)(this.poolConfig.state.title, `contracts.pool.id`, poolDeployment.contractTxId);
        }
        catch (e) {
            console.log(e);
            throw new Error(`Failed to create pool with error ${e}`);
        }
    }
}
exports.default = PoolCreateClient;
