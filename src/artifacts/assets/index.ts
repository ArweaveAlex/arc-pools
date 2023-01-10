import Bundlr from '@bundlr-network/client';
import Arweave from 'arweave';
import { readFileSync } from 'fs';
import { Warp, WarpFactory, defaultCacheOptions, Contract, LoggerFactory } from 'warp-contracts';
import { ArweaveSigner } from 'arbundles/src/signing';
import { createData } from 'arbundles';

let keys: any;
let bundlr: Bundlr;
let jwk: any;
let contract: Contract;
const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true });
    

LoggerFactory.INST.logLevel("fatal");

async function getRandomContributor() {
  const evaluationResults: any = await contract.readState();
  const state = evaluationResults.cachedValue.state;
  return selectTokenHolder(state.tokens, state.totalSupply);
}

export function selectTokenHolder(tokens: any, totalSupply: number) {
  const weights: { [key: string]: any } = {};
  for (const address of Object.keys(tokens)) {
      weights[address] = tokens[address] / totalSupply;
  }
  let sum = 0;
  const r = Math.random();
  for (const address of Object.keys(weights)) {
      sum += weights[address];
      if (r <= sum && weights[address] > 0) {
          return address;
      }
  }

  throw new Error("Unable to select token holder");
}

function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

export const generateTweetName = (tweet: any) => {
  if(tweet.text){
    if(tweet.text.length > 30){
      return 'Username: ' + tweet.user.name + ', Tweet: ' + truncateString(tweet.text, 30);
    } else {
      return 'Username: ' + tweet.user.name + ', Tweet: ' + tweet.text;
    }
  } else if (tweet.full_text) {
    if(tweet.full_text.length > 30){
      return 'Username: ' + tweet.user.name + ', Tweet: ' + truncateString(tweet.full_text, 30);
    } else {
      return 'Username: ' + tweet.user.name + ', Tweet: ' + tweet.full_text;
    }
  } else {
    return 'Username: ' + tweet.user.name + ', Tweet Id: ' + tweet.id;
  }

}

export const createAsset = async (
    bundlrIn: Bundlr,
    contractIn: Contract,
    content: any,
    additionalPaths: any,
    config: any,
    contentType: string,
    articleTitle: string
) => {

  keys = JSON.parse(readFileSync(config.walletPath).toString());
  jwk = keys;
  bundlr = bundlrIn;
  contract = contractIn;
  contract.setEvaluationOptions({
    allowBigInt: true
  })

  const data = contentType === 'application/json' ? JSON.stringify(content) : content;
  const assetTags = [{ name: 'Content-Type', value: contentType }];

  const assetTx = bundlr.createTransaction(data, { tags: assetTags });
  await assetTx.sign();
  let assetId: string;
  
  // Deploying asset to bundlr
  try {
    const cost = await bundlr.getPrice(assetTx.size);
    // console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
    try{
        await bundlr.fund(cost.multipliedBy(1.1).integerValue());
    } catch (e: any){
        console.log(`Error funding bundlr, probably not enough funds in arweave wallet...\n ${e}`);
        throw new Error(e);
    }
    const assetBundlrResponse = await assetTx.upload();
    // console.log("Bundlr asset ID: " + assetBundlrResponse.id);
    assetId = assetBundlrResponse.id
  } catch (err) {
    throw new Error("Error while uploading to bundlr: " + err);
  }    

  //Linking bundlr asset to warp contract
  try {
    const dataAndTags = await createDataAndTags(
      assetId, 
      contentType === 'application/json' ? generateTweetName(content) : articleTitle, 
      contentType === 'application/json' ? generateTweetName(content) : articleTitle, 
      contentType === 'application/json' ? 'application/json' : 'web-page', 
      contentType,
      additionalPaths,
      config
    );

    await deployToWarp(dataAndTags);

  } catch (err) {
    throw new Error(err);
  }
}


async function deployToWarp(
  dataAndTags:any,
) {
  try {
    const signer = new ArweaveSigner(jwk);
    const dataItem = createData(dataAndTags.data, signer, { tags: dataAndTags.tags });
    await dataItem.sign(signer);
    // console.log("Warp ID: " + dataItem.id);

    await warp.createContract.deployBundled(dataItem.getRaw());
    return dataItem.id;
  } catch(e: any){
    console.log(`Error uploading to warp...\n ${e}`);
    throw new Error(e);
  }
  
}

async function createDataAndTags(
  assetId: string, 
  name: string, 
  description: string, 
  assetType: string, 
  contentType: string,
  additionalPaths: any,
  config: any,
) {
  const tokenHolder = await getRandomContributor();
	const dNow = new Date().getTime();

  let index = contentType === 'application/json' ? { path: "tweet.json" } : { path: "index.html" };
  let paths = contentType === 'application/json' ? { "tweet.json": { id: assetId } } : { "index.html": { id: assetId } };
  let aType = contentType === 'application/json' ? "Alex-Messaging" : "Alex-Webpage"
  return {
    data: JSON.stringify({
      manifest: "arweave/paths",
      version: "0.1.0",
      index: index,
      paths: paths
    }),
    tags: [
      { name: 'App-Name', value: 'SmartWeaveContract' },
      { name: 'App-Version', value: '0.3.0' },
      { name: 'Content-Type', value: "application/x.arweave-manifest+json" },
      { name: 'Contract-Src', value: config.contracts.nft.src},
      { name: "Pool-Id", value: config.contracts.pool.id },
      { name: 'Title', value: name },
      { name: 'Description', value: description },
      { name: 'Type', value: assetType },
      { name: "Artifact-Series", value: "Alex." },
      { name: "Artifact-Name", value: name },
      { name: "Initial-Owner", value: tokenHolder },
      { name: "Date-Created", value: dNow.toString() },
      { name: "Artifact-Type", value: aType},
      { name: 'Keywords', value: JSON.stringify(config.keywords) },
      { name: "Media-Ids", value: JSON.stringify(additionalPaths)},
      { name: "Implements", value: "ANS-110" },
      { name: "Topic", value: "Topic:" + config.keywords[0]},      
      {
        name: 'Init-State', value: JSON.stringify({
          ticker: "ATOMIC-ASSET-" + assetId,
          balances: {
            [tokenHolder]: 1
          },
          contentType: contentType,
          description: `${description}`,
          lastTransferTimestamp: null,
          lockTime: 0,
          maxSupply: 1,
          title: `Alex Artifact - ${name}`,
			    name: `Artifact - ${name}`,
          transferable: false,
          dateCreated: dNow.toString(),
          owner: tokenHolder
        }).replace(/[\u007F-\uFFFF]/g, function(chr) {
          return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
        })
      }
    ]
  }
}