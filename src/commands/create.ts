import fs from "fs";
import clc from "cli-color";
import mime from 'mime';
import path from "path";

const readline = require('readline');

import { 
    ArweaveClient,
    PoolConfigType, 
    PoolClient,
    PoolConfigClient,
    PoolCreateClient,
    sonarLink
} from "arcframework";

import { exitProcess, log } from "../helpers/utils";
import { validatePoolConfig, validateControlWalletPath } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { createWallet } from "../helpers/wallet";

import { CLI_ARGS, POOL_FILE, POOL_TEST_MODE } from "../helpers/config";

function askQuestion(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    return new Promise((resolve) => {
      rl.question(question, (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });
}

const command: CommandInterface = {
    name: CLI_ARGS.commands.create,
    description: `Create a pool using ${POOL_FILE}`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        const poolConfigClient: PoolConfigClient = new PoolConfigClient({testMode: POOL_TEST_MODE});
        const arClient = new ArweaveClient();
        const controlWalletPath: string = validateControlWalletPath(args.argv["control-wallet"]);
        const poolPath: string = POOL_FILE;
        const POOLS_JSON = JSON.parse(fs.readFileSync(poolPath).toString());
        const poolArg = args.commandValues[0];
        const pConfig: PoolConfigType = POOLS_JSON[poolArg];
        let controlWalletJwk: any;
        let image: Buffer = null;
        let imageType: string = null;
        let poolCreateClient: PoolCreateClient;
        let controlWalletAddress: string;
        let walletInfo: any;
        let newConfig: any;

        try {
            await poolConfigClient.validateNewPoolConfig({poolConfig});

            controlWalletJwk = JSON.parse(fs.readFileSync(controlWalletPath).toString());
            controlWalletAddress = await arClient.arweavePost.wallets.jwkToAddress(controlWalletJwk);

            while(true) {
                const answer1 = await askQuestion('Would you like to use your control wallet as the wallet which will receive pool contributions? If you answer no this program will generate another wallet for the pool. (y/n) ');

                log(answer1, 0);

                if (answer1.toLowerCase() === 'y') {
                    walletInfo = {
                        file: controlWalletPath,
                        address: controlWalletAddress,
                        keys: controlWalletJwk
                    };
                    break;
                } else if(answer1.toLowerCase() === 'n') {
                    walletInfo = await createWallet(poolArg);
                    break;
                } else {
                    log('Please enter y or n', 0);
                }
            }
  
            if (args.argv["image"]) {
                if (!fs.existsSync(args.argv["image"])) {
                    throw new Error(`Image file does not exist`);
                }
                image = await fs.promises.readFile(path.resolve(args.argv["image"]));
                imageType = mime.getType(args.argv["image"]);
            } 

            let signedWallet = (new ArweaveClient()).warpPluginArweaveSigner(controlWalletJwk);

            pConfig.state.owner.pubkey = walletInfo.address;

            poolCreateClient = new PoolCreateClient(
                {
                    poolConfig: pConfig,
                    controlWalletJwk: controlWalletJwk,
                    controlWalletAddress: controlWalletAddress,
                    signedControlWallet: signedWallet,
                    poolWalletPath: walletInfo.file,
                    img: image,
                    imgFileType: imageType,
                }
            )

            newConfig = await poolCreateClient.createPool();

            POOLS_JSON[poolArg] = newConfig;
            fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
            console.log(`Pool File Updated`);
        }
        catch (e: any){
            exitProcess(`${e}`, 1);
        }

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Would you like to contribute to your pool from your control wallet to begin mining sooner? (y/n) ', async (answer: string) => {
            if (answer.toLowerCase() === 'y') {
                let controlWalletBalance  = await arClient.arweavePost.wallets.getBalance(controlWalletAddress);

                let arBalance = arClient.arweavePost.ar.winstonToAr(controlWalletBalance);

                if(arBalance < 0.01) {
                    console.log("You do not have enough funds to contribute now");
                    finishOut(newConfig.contracts.pool.id, rl);
                } else {
                    newConfig.walletKey = controlWalletJwk;
                    let poolClient: PoolClient = new PoolClient({poolConfig: newConfig});

                    askForBalance(
                        arBalance, 
                        poolClient, 
                        walletInfo, 
                        rl, 
                        newConfig
                    );
                }
            } else {
                finishOut(newConfig.contracts.pool.id, rl);
            }
        });
    }
}

function askForBalance(
    arBalance: number, 
    poolClient: PoolClient, 
    walletInfo: {
        file: string;
        address: any;
    },
    rl: any,
    poolConfig: PoolConfigType
) {
    rl.question(`How much would you like to contribute. You have ${arBalance} ar to contribute, enter a decimal amount greater than 0.01: `, async (amount: string) => {
        const am = parseFloat(amount);
        if (isNaN(am) || (am <= 0) || (am > arBalance) || (am < 0.01)) {
            console.log('Invalid input. Please enter a valid positive number greater than 0.01');
            askForBalance(arBalance, poolClient, walletInfo, rl, poolConfig); 
        } else {
            let r = await poolClient.handlePoolContribute({ amount: am, availableBalance: arBalance });
            
            if(!r.status) {
                log("Contribution failed, please contribute via the Alex site ...", 0);
                finishOut(poolConfig.contracts.pool.id, rl);
                return;
            }
            
            log("Waiting for contribution funds to come through to send them to Bundlr, this will take a while...", 0);
            do {
                let poolBalance  = await poolClient.arClient.arweavePost.wallets.getBalance(walletInfo.address);
                if(poolBalance > 0) {
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    let keys = JSON.parse(fs.readFileSync(walletInfo.file).toString());
                    let newArClient = new ArweaveClient(keys);
                    try {
                        log("Attempting Bundlr fund...", 0);
                        await newArClient.bundlr.fund(Math.floor(poolBalance/2));  
                        console.log("Bundlr funded...");
                        break;
                    } catch(e: any) {
                        log("Retrying Bundlr...", 0);
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 60000)); 
                }
            } while(true);

            log("Your funds have been contributed...", 0);
            finishOut(poolConfig.contracts.pool.id, rl);
        }
    });
}

function finishOut(contractTxId: string, rl: any) {
    log(`Your pool has been deployed, please wait for the pool to display correctly from the below link before proceeding...`, 0);
    log(clc.magenta(sonarLink(contractTxId)), 0);
    rl.close();
}

export default command;