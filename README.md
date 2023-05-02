# Alex. CLI

[Alex](https://alex.arweave.dev). is a decentralized archival platform that leverages the immutable and permanent data storage of Arweave and includes a mechanism that encourages end user participation.

Users contribute to pools and they receive “artifacts” back into their wallet as they are minted. Artifacts are NFTs of items that the pool is storing. Since the artifacts are stored on Arweave, they cannot be changed or removed in any way by anyone.

This repository is the client tool for creating the pools and mining artifacts.

## Table of Contents
  - [How it works](#how-it-works)
  - [Requirements](#requirements)
  - [Installing Alex. CLI](#installing-alex-cli)
  - [Configuring a pool](#configuring-a-pool)
  - [Creating a pool](#creating-a-pool)
  - [Funding a pool wallet](#funding-a-pool-wallet)
  - [Mining artifacts](#mining-artifacts)
  - [Daemon mode mining](#daemon-mode-mining)

## How it works

### Pool Operator

Anyone can create a pool with Alex. for any given topic/event. An operator creates a pool and mines artifacts into it. These artifacts are deployed as assets to Arweave and distributed to the contributors based on the amount of $AR contributed. These artifacts are in the form of a tweet, Wikipedia page, Reddit post, and Nostr posts and as they are processed they get randomly transferred to a contributor's wallet.

### Pool Contributor

Users contribute to pools and they receive “artifacts” in their wallet as they are mined. The more a user contributes to any given collection, the higher the chances are of receiving these artifacts.

## Requirements
`arcpool` requires NodeJS (v18+)/NPM and Git installed.
[NodeJS](https://nodejs.org/en/download/)
[Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

An Arweave web wallet with a small amount of $AR on it is needed to deploy your pool. You can get one here:

*   [Arweave Wallet](https://docs.arweave.org/info/wallets/arweave-wallet)
*   [ArConnect](https://arconnect.io)
*   [Arweave faucet wallet](https://faucet.arweave.net) (0.2 $AR loaded if your Twitter account is approved)

## Installing Alex. CLI
To install arcpool run `npm install --global arcpool` in your terminal.

```sh 
npm install --global arcpool
```

```
Options                                                     Description
--clear                                                     Clear local files used on command
--content-moderation                                        Use content moderation on twitter mining
--control-wallet <wallet file>                              Specifies a wallet to use in the pool creation
--dname <string>                                            Specifies the daemon name to stop
--image <path to image file>                                Specifies an image to use for pool
--mention-tag <username>                                    Username for twitter or reddit with --method user
--meta-file <path to metadata file>                         Specifies a metadata config for file uploads
--method <user / mention / subreddit / search>              Subcategory within source such as user
--path <path to file or directory>                          Specifies a directory or file to upload
--search-term <search term>                                 Search term to mine
--source <files / twitter / wikipedia / reddit / nostr>     Specifies the data source
--subreddit <subreddit>                                     Subreddit to mine
--topic-values <comma seperated list of topics>             Comma seperated list of topics


Commands                                                    Description
balance <pool id>                                           Check the Bundlr and Arweave balance for the pool wallet
create <pool id>                                            Create a pool using pools.json
dlist                                                       list all daemon mining processes
dstop <daemon name>                                         Stop a daemon mining process by name
evolve <pool id>                                            Evolve the pool contract
fund <pool id>                                              Fund the bundlr wallet for a pool
help                                                        Display help text
init <pool id>                                              Initialize pools.json
mine <pool id>                                              Mine artifacts for a given pool
topics <pool id>                                            Set the pool topics in pool state
```


## Configuring a pool
Create a directory for the pool configurations and wallets. Name the directory anything you want.

To create a pool you must do the following steps:
1. Initiate the pool
2. Configure the pool
3. Connect wallet client and create pool 

### Initiate the pool

In the terminal you will create a directory for pool configurations and wallets.

1. Create directory
```sh
mkdir {DIRECTORY_NAME}
```
2. Change into the directory that you created 
```sh 
cd {DIRECTORY_NAME}
```
3.  Create a ```pools.json``` file. 
```sh
arcpool init {POOL_ID}
``` 

>- {POOL_ID} refers to a string of your choosing which will identify the pool locally for the client. 
>- This string is only used in CLI commands to identify which pool you are working with and this will not be visible on Alex.
>- You will edit this ```pools.json``` file and it will also be modified by the client so do not delete it after running the <strong>create </strong> and <strong>mine</strong> commands, unless you need to start over.


### Example: 

```
mkdir alex-test
cd alex-test
arcpool init test-alex
```

### Edit the pool.json configuration

Below is the ```pools.json``` file that has been initiated that now needs to be configured.
```json
{
    "POOL-ID": {
        "appType": "Alex-Archiving-Pool-v1.4",
        "contracts": {
            "nft": {
                "id": "",
                "src": ""
            },
            "pool": {
                "id": "",
                "src": ""
            },
            "poolSearchIndex": {
                "id": "",
                "src": ""
            }
        },
        "state": {
            "owner": {
                "pubkey": "",
                "info": ""
            },
            "controller": {
                "pubkey": "",
                "contribPercent": 0
            },
            "title": "Pool Title",
            "description": "Paragraph/html markup for long pool description",
            "briefDescription": "Text for short pool description",
            "link": "",
            "rewards": "",
            "image": "",
            "timestamp": ""
        },
        "walletPath": "",
        "bundlrNode": "https://node2.bundlr.network",
        "twitter": {
            "userIds": []
        },
        "keywords": [
            "keyword1"
        ],
        "twitterApiKeys": {
            "consumer_key": "",
            "consumer_secret": "",
            "token": "",
            "token_secret": "",
            "bearer_token": ""
        },
        "clarifaiApiKey": "",
        "topics": [
            "history"
        ],
        "redditApiKeys": {
            "username": "",
            "password": "",
            "appId": "",
            "appSecret": ""
        },
        "nostr": {
            "keys": {
                "public": "",
                "private": ""
            },
            "relays": [
                {
                    "socket": "wss://relay.damus.io"
                },
                {
                    "socket": "wss://nos.lol"
                },
                {
                    "socket": "wss://nostr.relayer.se"
                },
                {
                    "socket": "wss://relay.current.fyi"
                },
                {
                    "socket": "wss://nostr.bitcoiner.social"
                },
                {
                    "socket": "wss://relay.nostr.info"
                },
                {
                    "socket": "wss://nostr.fmt.wiz.biz"
                }
            ]
        }
    }
}
```
Configure the `pools.json` file to generate your pool. If there is a field not marked in this section that exists in `pools.json`, it does not need to be modified.

- `state.title` is the title of your pool on the [Home Page](https://alex.arweave.dev) of Alex.
- `state.description` is a long description of your pool on the [Pool Detail](https://alex.arweave.dev/#/pool/zIZXNTl-GtTDbO8eP8LpkHks5S5WhB4j82YX-N2RuGw) page of Alex., under the About header. It can contain Text and/or HTML.
- `state.briefDescription` is a brief description of your pool on the [Home Page](https://alex.arweave.dev) of Alex.
- `keywords` is a list of the main keywords to track in the mining process. This is the core driving data that instructs the mining programs of what to pull from mining sources such as Twitter, Wikipedia, Reddit, or Nostr
- `topics` A list of more general topics the pool fits into, these generate ANS110 Topic tags in the data. These drive filters on the Alex site and must be one of the following strings, History, Philosophy, International, Culture, Art, Music, Faith, Spirituality, Sports, Business, Technology, Politics, Other.
- `controller.contribPercent` is a reward percentage of the contributions. This value can be from **0 - 100** and represents the total percentage of contributions that go to your control wallet for mining. If the value of **controller.contribPercent** is **10**, then **10%** of all contributions will go to your control wallet as a reward. This percentage will appear in the User Interface to let contributors know how much of their contribution will go to the operator.

### Configure Twitter API Keys 

- Get Twitter API credentials [here](https://developer.twitter.com/en/docs/authentication/oauth-1-0a/api-key-and-secret#:~:text=Navigate%20to%20the%20developer%20portal,the%20Keys%20and%20tokens%20tab). (Get elevated access for better mining, but not mandatory)
- Enter credentials into `twitterApiKeys`
  - `consumer_key` = **API key** in the Twitter developer platform
  - `consumer_secret` = **Secret** in the Twitter developer platform
  - `token` = **Access Token** in the Twitter developer platform
  - `token_secret` = **Access Token Secret** in the Twitter developer platform
  - `bearer_token` =  **Bearer Token**  in the Twitter developer platform
  - `clarifaiApiKey` if you plan to use content moderation on tweets in the mining process, you can get an api key from [Clarifai](https://www.clarifai.com/) and put it here. This will filter out explicit content from being mined into the pool. This is a bit expensive and unecessary in most situations but if you are finding a lot of explicit content in the pool it may be of value to you.

### Configure Reddit API Keys 
- `redditApiKeys` login or create a Reddit account and then get API access [here](https://www.reddit.com/prefs/apps)  
- Use `username` and `password` from Reddit 
- Insert `appId` and `appSecret` recieved from Reddit

## Creating a pool

To create a pool you only need to run 1 command with a few arguments passed in, including the name from when you initialized the pool, path to wallet you created and saved from the steps in [Requirements](#Requirements), along with a path to your pools header image.

```sh 
arcpool create <POOL_NAME> --control-wallet <PATH_TO_WALLET.json> --image <PATH_TO_IMAGE>
``` 
  
For example: 
```sh
arcpool create init-test-alex --control-wallet ../wallet.json --image ../pool-image.jpg
```

Take note of the line at the top of the logs for your pool wallets seed phrase. Inside your working directory should be a `wallets` directory. This is where your pool collection wallet is stored and should be kept safe, along with the seed phrase logged by the CLI. Write down your seed phrase.

**Do not give this to anyone. Without this you have no way to recover your wallet should anything happen.**

    *** Write the following seed phrase down ***
    
     this will be your pool wallet seed phrase do not give out
     
    *** THERE IS NO WAY TO RECOVER YOUR SEED PHRASE SO WRITE IT DOWN AND KEEP IT OUT OF OTHERS HANDS ***
    
At the end of the process the cli should ask you if you want to contribute funds from your control wallet. This is recommended as it will allow you to begin mining
more quickly and will skip steps later. When the prompt asks, enter a decimal amount of AR less than what you have in your wallet and hit enter. The funding portion
will take a long time because it is waiting for the transactions to process on the blockchain. Wait for the program to finish.

If your pool has been successfully created, you can now navigate to [https://alex.arweave.dev/#/pools](https://alex.arweave.dev/#/pools) and view your new pool.

To add another pool, follow the same steps as above in the same directory with the `pools.json`

## Funding a pool wallet
If you have not contributed when creating the pool, then before we start to mine artifacts, we will need contributions from the site. This can be a small amount to get started just to trigger the CLI to start transferring your funds to your pools Bundlr instance. We will only need to do this once and as more contributions are made it will be updated automatically as we run the mining service.

Find and navigate to your pool in [https://alex.arweave.dev/#/pools](https://alex.arweave.dev/#/pools) and click the contribute button. Contribute a small amount of $AR to your collection and wait for that contribution to display in the UI. Once that has registered the funds to the pool, go back to your terminal and run:

```sh
arcpool fund POOL_NAME
```

For example:

![](https://arweave.net/i5plrxbqSoSTMt0jL5LhZAND4CjUohRkSDjIezXaOZc)

Please note that funding a Bundlr instance can take up to 30 minutes. To check the status of the funding you can use the command: 

```sh
arcpool balance POOL_NAME
```

![](https://arweave.net/BNHao7jhk061DOv9XErm5jcdOUUsB0UgNvmLXLJZEF8)

Once we see that we have Bundlr funds we can proceed to the mining process.

## Mining artifacts

> **Before Mining:** double check the `keywords` in the `pools.json` to prevent unwanted artifacts in your pool.

The mining process can begin in the directory containing the `pools.json` by running these commands.

### Files and Documents

**Mine a file**

```sh
arcpool mine POOL_NAME --source files --path examplefile.jpg
```

**Mine a directory of files**

```sh
arcpool mine POOL_NAME --source files --path ./exampledirectory
```

**Optionally you can add metadata to your files by creating a metadata file that contains a JSON array with entries as follows, name this file whatever you want it will be passed as an argument**

```json
[
  {
    "FileName": "examplefile.jpg",
    "ArtifactName": "test name",
    "ArtifactGroup": "Group1",
    "ArtifactGroupSequence": "1",
    "MetaData": {
      "ExampleMetaDataField1(whatever you want for example AddressWherePictureTaken)": "Here is some metadata about the file",
      "ExampleMetaDataField2": "Here is some more metadata about the file"
    }
  },
  {
    "FileName": "examplefile2.jpg",
    "ArtifactName": "test name 2",
    "ArtifactGroup": "Group2",
    "ArtifactGroupSequence": "1",
    "MetaData": {
      "ExampleMetaDataField1(whatever you want for example AddressWherePictureTaken)": "Here is some metadata about the file",
      "ExampleMetaDataField2": "Here is some more metadata about the file"
    }
  }
]
```

- Fill out the metadata file as follows
    - FileName, the only mandatory field which ties this entry in the file to the filename being mined
    - ArtifactName, an optional name for the artifact that will show up in Alex
    - ArtifactGroup, an optional grouping for the artifact, if multiple files have the same group they will be grouped together
    - ArtifactGroupSequence, an ordering within the group, the lower numbers will display first in Alex
    - MetaData, can be any data fields you want to be stored alongside the file.

**Mine a file with a metadata config**

```sh
arcpool mine POOL_NAME --source files --path examplefile.jpg --meta-file ./metafile.json
```

**Mine a directory of files with a metadata config**

```sh
arcpool mine POOL_NAME --source files --path ./exampledirectory --meta-file ./metafile.json
```

**Lastly, when sending a directory, arcpool will store a list of files already sent and not send duplicates, to send all files again, use the --clear option**

```sh
arcpool mine POOL_NAME --source files --path ./exampledirectory --meta-file ./metafile.json --clear
```

### Twitter

**Mine tweets (runs 100 tweets at a time)**

```sh
arcpool mine POOL_NAME --source twitter
```

**Mine all tweets based on user and tag** 

For example: mine all tweets with  "@thealexarchive #TOPIC"

```sh
arcpool mine POOL_NAME --source twitter --method mention --mention-tag "@thealexarchive #TOPIC"
```

**Mine all tweets ever from a particular user** 

For example: mine all tweets from SBF\_FTX 
- Do not include the @ in the **--username value**

```sh
arcpool mine POOL_NAME --source twitter --method user --username SBF_FTX
```

### Wikipedia

**Mine a single Wikipedia article related to the given `keywords` in config**

```sh 
arcpool mine POOL_NAME --source wikipedia
```

### Reddit

**Mine Reddit posts by search term**
```sh 
arcpool mine wildlife --source reddit --method search --search-term america
```

**Mine Reddit posts by subreddit**
```sh
arcpool mine wildlife --source reddit --method subreddit --subreddit webdev
```

**Mine Reddit posts by username**
```sh
arcpool mine wildlife --source reddit --method user --username exampleusername
```

### Nostr
**Mine common Nostr threads for posts related to the keywords**

```sh
arcpool mine <POOL_ID> --source nostr
```

## Checking mining process

After a few minutes of mining we can navigate back to our collection at Alex. and see that our collection count is growing and contributors are having artifacts minted to their addresses as expected. ![](https://arweave.net/5ba8fVrTZZYFSc4hCVM2lf0wTwfad7n0FKZfnqSBHbM)

## Daemon mode mining

If you wish to continually run a mining process, use daemon mode by passing the `--d` flag to any of the above mining commands. Daemon mode is built on top of pm2.

#### Mine tweets into the pool from above, still runs for 20 seconds but the daemon mode will continue restarting the program infinetly. Note the `--d` flag.

```sh
arcpool mine POOL_NAME --source twitter --d
```

**To view all the daemon mode mining processes:**
```sh
arcpool dlist
```

**Output will look similar to:**

    daemon processes -
    pid: 0    pm_id: 0    name: POOL_NAME    status: running
    

**Stop a pools daemon process by name:**
```sh
arcpool dstop --dname POOL_NAME
```

**To view logs for the mining processes install pm2:**

```sh
npm install --global pm2
```

**Stream the logs:**

```sh
pm2 logs
```


## Updating pool topics for site filter

**When you initially create the pool you will set topics into the tags. However you can set more topics into the state for the site filter to use by running the topics command. Feed in a comma seperated list of topics that match the following values, History, Philosophy, International, Culture, Art, Music, Faith, Spirituality, Sports, Business, Technology, Politics, Other**

```sh
arcpool topics POOL_NAME --topic-values History,Politics,Other
```