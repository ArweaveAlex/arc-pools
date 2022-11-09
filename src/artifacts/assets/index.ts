import Bundlr from '@bundlr-network/client';
import Arweave from 'arweave';
import { readFileSync } from 'fs';
import { Contract, LoggerFactory, Warp, WarpNodeFactory } from 'warp-contracts';

const URL = 'https://gateway.redstone.finance/gateway/contracts/deploy';

let keys: any;
let bundlr: Bundlr;
let arweave: Arweave;
let jwk: any;
let smartweave: Warp;
let contract: Contract;

LoggerFactory.INST.logLevel("fatal");

async function getRandomContributor() {
  const state: any = await contract.readState();
  return selectTokenHolder(state.state.tokens, state.state.totalSupply);
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

const generateTweetName = (tweet: any) => {

  if(tweet.text){
    if(tweet.text.length > 30){
      return 'Username: ' + tweet.user.name + ', Tweet: ' + truncateString(tweet.text, 30);
    } else {
      return 'Username: ' + tweet.user.name + ', Tweet: ' + tweet.text;
    }
  } else {
    return 'Username: ' + tweet.user.name + ', Tweet Id: ' + tweet.id;
  }

}

export const createAsset = async (
    bundlrIn: Bundlr,
    arweaveIn: Arweave,
    warpIn: Warp,
    contractIn: Contract,
    content: any,
    additionalPaths: any,
    config: any,
    contentType: string,
    articleTitle: string
) => {

  keys = JSON.parse(readFileSync(config.walletPath).toString());
  jwk = keys.arweave;
  bundlr = bundlrIn;
  arweave = arweaveIn;
  smartweave = warpIn;
  contract = contractIn;

  try {
    const data = contentType === 'application/json' ? JSON.stringify(content) : content;
    
    const tx = await arweave.createTransaction({
      data: data
    }, jwk);

    tx.addTag('Content-Type', contentType);

    try {
      await arweave.transactions.sign(tx, jwk);
      const assetId = tx.id;
      let uploader = await arweave.transactions.getUploader(tx);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }

      console.log(assetId);
      
      createAtomicAsset(
        assetId, 
        contentType === 'application/json' ? generateTweetName(content) : articleTitle, 
        contentType === 'application/json' ? generateTweetName(content) : articleTitle, 
        contentType === 'application/json' ? 'application/json' : 'web-page', 
        contentType,
        additionalPaths,
        config
      );

    } catch (err) {
      console.log(err)
    }
  }
  catch (err) {
    console.error(err)
  }
}

async function createAtomicAsset(
    assetId: string, 
    name: string, 
    description: string, 
    assetType: string, 
    contentType: string,
    additionalPaths: any,
    config: any
) {
  try {
    const dataAndTags = await createDataAndTags(
      assetId, 
      name, 
      description, 
      assetType, 
      contentType,
      additionalPaths,
      config
    )
    const atomicId = await dispatchToBundler(dataAndTags, contentType)
    await deployToWarp(atomicId, dataAndTags, contentType)
    return atomicId
  } catch (e) {
    console.log(e)
    return Promise.reject('Could not create Atomic Transaction')
  }
}

export async function dispatchToBundler(
  dataAndTags:any, 
  contentType: string
) {
  let { data, tags } = dataAndTags;
  const tx = bundlr.createTransaction(data, { tags: tags });
  await tx.sign();
  const id = tx.id;
  const cost = await bundlr.getPrice(tx.size);
  console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
  try{
      await bundlr.fund(cost.multipliedBy(1.1).integerValue());
  } catch (e: any){
      console.log(`Error funding bundlr, probably not enough funds in arweave wallet stopping process...\n ${e}`);
      process.exit(1);
  }
  await tx.upload()
  console.log("BUNDLR ATOMIC ID", id)
  return id
}

async function deployToWarp(
  atomicId: string, 
  dataAndTags:any,
  contentType: string
) {
  let { data, tags } = dataAndTags;
  const tx = await arweave.createTransaction({ data })
  tags.map((t: any) => tx.addTag(t.name, t.value))

  await arweave.transactions.sign(tx, jwk)
  tx.id = atomicId

  const result = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify({ contractTx: tx }),
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/json",
      Accept: "application/json"
    }
  })
  console.log("ATOMIC ID", tx.id)
  return { id: atomicId }
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
      { name: 'Contract-Src', value: config.nftContractSrc},
      { name: "Pool-Id", value: config.pool.contract },
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
        })
      }
    ]
  }
}