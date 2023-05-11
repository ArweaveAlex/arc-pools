"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
const client_1 = __importDefault(require("@bundlr-network/client"));
const gql_1 = require("../../gql");
const config_1 = require("../../helpers/config");
const types_1 = require("../../helpers/types");
const utils_1 = require("../../helpers/utils");
const arweave_1 = require("../arweave");
// TODO: Language to site provider
class PoolClient extends arweave_1.ArweaveClient {
    constructor(poolConfig) {
        super();
        this.arClient = new arweave_1.ArweaveClient();
        this.poolConfig = poolConfig;
        this.bundlr = new client_1.default("https://node2.bundlr.network", "arweave", poolConfig.walletKey);
        this.contract = this.arClient.warp.contract(poolConfig.contracts.pool.id).setEvaluationOptions({
            allowBigInt: true
        });
        this.warp = this.arClient.warp;
        this.validatePoolConfigs = this.validatePoolConfigs.bind(this);
    }
    async validatePoolConfigs() {
        console.log(`Checking Exisiting Pools ...`);
        const exisitingPools = await (0, gql_1.getPools)();
        let poolConfig = this.poolConfig;
        exisitingPools.forEach(function (pool) {
            if (poolConfig.state.title === pool.state.title) {
                throw new Error(`Pool Already Exists`);
            }
        });
        let validTopic = false;
        poolConfig.topics.map((topic) => {
            if (topic in types_1.ANSTopicEnum) {
                validTopic = true;
            }
        });
        let topics = Object.values(types_1.ANSTopicEnum).join(', ');
        if (!validTopic) {
            throw new Error(`Must configure at least 1 topic with one of the following values ${topics}`);
        }
    }
    async getUserContributions(userWallet) {
        let pools = await (0, gql_1.getPools)();
        if (pools.length > 0) {
            const lastContributions = await this.calcLastContributions(userWallet, pools);
            return pools
                .filter((pool) => {
                if (pool.state.contributors.hasOwnProperty(userWallet)) {
                    return true;
                }
                return false;
            })
                .map((pool) => {
                let poolElement = pool;
                poolElement.totalContributed = this.calcARDonated(userWallet, pool);
                poolElement.lastContribution = lastContributions[pool.id];
                poolElement.receivingPercent = this.calcReceivingPercent(userWallet, pool);
                return poolElement;
            });
        }
        else {
            return pools;
        }
    }
    calcARDonated(userWallet, pool) {
        let calc = parseFloat(this.calcContributions(pool.state.contributors[userWallet])) / 1000000000000;
        let tokens = calc.toFixed(calc.toString().length);
        return tokens;
    }
    calcReceivingPercent(userWallet, pool) {
        if (pool) {
            let calc = (parseFloat(this.calcContributions(pool.state.contributors[userWallet])) /
                parseFloat(pool.state.totalContributions)) *
                100;
            let tokens = calc.toFixed(4);
            return tokens;
        }
        else {
            return 0;
        }
    }
    async calcLastContributions(userWallet, pools) {
        const artifacts = await (0, gql_1.getArtifactsByUser)({
            ids: null,
            owner: userWallet,
            uploader: null,
            cursor: null,
            reduxCursor: null,
        });
        let contributionMap = {};
        for (let i = 0; i < pools.length; i++) {
            let lastDate = 0;
            for (let j = 0; j < artifacts.contracts.length; j++) {
                const date = parseInt((0, utils_1.getTagValue)(artifacts.contracts[j].node.tags, config_1.TAGS.keys.dateCreated));
                if (date > lastDate) {
                    lastDate = date;
                    contributionMap[pools[i].id] = date;
                }
            }
        }
        return contributionMap;
    }
    getReceivingPercent(userWallet, contributors, totalContributions, activeAmount) {
        if (userWallet && contributors && totalContributions) {
            if (isNaN(activeAmount)) {
                return '0';
            }
            let amount = 0;
            amount = activeAmount * 1e12;
            let origAmount = amount;
            if (contributors[userWallet]) {
                if (isNaN(contributors[userWallet])) {
                    let contribs = contributors[userWallet];
                    let total = 0;
                    for (let i = 0; i < contribs.length; i++) {
                        let c = contribs[i];
                        total = total + parseInt(c.qty);
                    }
                    amount = total + amount;
                }
                else {
                    amount = parseFloat(contributors[userWallet]) + amount;
                }
            }
            let calc = amount;
            if (parseFloat(totalContributions) > 0) {
                calc = (amount / (parseFloat(totalContributions) + origAmount)) * 100;
            }
            let tokens = calc.toFixed(4);
            if (isNaN(calc))
                return '0';
            return calc >= 100 ? '100' : tokens;
        }
        else {
            return '0';
        }
    }
    calcContributions(contributions) {
        let amount = 0;
        if (typeof contributions === 'object') {
            for (let i = 0; i < contributions.length; i++) {
                amount += Number(contributions[i].qty);
            }
        }
        else {
            amount = Number(contributions);
        }
        return amount.toString();
    }
    getARAmount(amount) {
        return Math.floor(+this.arweavePost.ar.winstonToAr(amount) * 1e6) / 1e6;
    }
    async handlePoolContribute(poolId, amount, availableBalance) {
        if (!availableBalance) {
            return { status: false, message: `Wallet Not Connected` };
        }
        if (amount > availableBalance) {
            return {
                status: false,
                message: `Not Enough Funds`,
            };
        }
        try {
            const arweaveContract = (await (0, gql_1.getGQLData)({
                ids: null,
                tagFilters: [{ name: config_1.TAGS.keys.uploaderTxId, values: [poolId] }],
                uploader: null,
                cursor: null,
                reduxCursor: null,
                cursorObject: null,
            })).data[0];
            const fetchId = arweaveContract ? arweaveContract.node.id : poolId;
            const { data: contractData } = await this.arweavePost.api.get(`/${fetchId}`);
            let owner = contractData.owner;
            if (arweaveContract) {
                owner = JSON.parse(buffer_1.Buffer.from(contractData.data, 'base64').toString('utf-8')).owner;
            }
            if (!owner) {
                return { status: false, message: `Pool Contribution Failed` };
            }
            const warpContract = this.warp.contract(poolId).connect('use_wallet').setEvaluationOptions({
                waitForConfirmation: false,
                allowBigInt: true,
            });
            let contractState = (await warpContract.readState()).cachedValue.state;
            let contribToPool = amount;
            let contribToController = 0;
            if (contractState.controlPubkey && !(contractState.controlPubkey.length === 0)) {
                if (contractState.contribPercent && contractState.contribPercent > 0) {
                    const percentDecimal = contractState.contribPercent / 100;
                    contribToController = amount * percentDecimal;
                    contribToPool = amount - contribToController;
                    await warpContract.writeInteraction({ function: 'contribute' }, {
                        disableBundling: true,
                        transfer: {
                            target: contractState.controlPubkey,
                            winstonQty: this.arweavePost.ar.arToWinston(contribToController.toString()),
                        },
                    });
                }
            }
            const result = await warpContract.writeInteraction({ function: 'contribute' }, {
                disableBundling: true,
                transfer: {
                    target: owner,
                    winstonQty: this.arweavePost.ar.arToWinston(contribToPool.toString()),
                },
            });
            if (!result) {
                return { status: false, message: `Pool Contribution Failed` };
            }
            return { status: true, message: `Thank you for your contribution.` };
        }
        catch (error) {
            console.error(error);
            return { status: false, message: `Pool Contribution Failed` };
        }
    }
}
exports.default = PoolClient;
