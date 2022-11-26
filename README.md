# Alex. CLI

[Alex](https://alex.arweave.dev). is a decentralized archival platform that leverages the immutable and permanent data storage of Arweave and includes a mechanism that encourages end user participation.

Users contribute to collections and they receive “artifacts” back into their wallet as they are minted. Artifacts are NFTs of items the collection is storing. Since the artifacts are stored on Arweave, they cannot be changed or removed in any way by anyone.

This repository is the client which creates the pools and mines artifacts into the pools.

## Installing Alex. CLI

arcpool runs using NodeJS and NPM. You must have both installed on your machine for it to work. You will also need an arweave wallet for the beginning creation process.


```
npm install --global arcpool
```

```
Usage: arcpool [command] [options]


Commands                                    Description
create                                      Create pool, options --control-wallet, --image
mine <pool_id>                              Mine artifacts, options --source, --method, --mention-tag
help                                        Print help
dlist                                       List daemon mining processes
dstop                                       Stop daemon mining process, options --dname


Options                                     Description
--source <twitter or wikipedia>             Used with command mine, mandatory, specifies mining program         
--method <mention>                          Used with command mine, optional, mines for --mention-tag value
--mention-tag <@username #something>        Used with command mine and option --method mention, value to search twitter for
--dname <pm2 daemon name>                   Used with command dstop, specifies daemon name to stop
--control-wallet <arweave wallet>           Used with command create, mandatory, path to wallet used for pool creation      
--image <path to image file>                Used with command create, path to image to upload for pool background image
```

## Creating a pool

__First make a directory anywhere on your machine which will contain pool configurations and wallets. You can call the directory anything you want.__

```
mkdir alexfiles
cd alexfiles
```

__Next, create a pools.json file which will contain all pool configurations for every one of you pools.__ You will edit this file yourself and it will also be modified by the client so don't delete it unless you need a fresh start. This will be required to run the program like package.json for npm. Put the  following json into the file, note this is an example.

```
[
    "russia-ukraine-test": {
        "appType": "Alex-Archiving-Pool-v1.8-Testing",
        "contracts": {
            "nft": {
                "id": "",
                "src": ""
            },
            "pool": {
                "id": "",
                "src": ""
            }
        },
        "state": {
            "owner": {
                "pubkey": "",
                "info": ""
            },
            "title": "The Russia/Ukraine Conflict 2 - Dummy v1.8",
            "description": "Arweave has been archiving data coming from Russia and Ukraine since before the war began. It was important to ensure that information individuals were posting online were permanently stored so governments and other centralized entities could not censor it in the future.<br>",
            "link": "",
            "rewards": "",
            "image": "",
            "timestamp": ""
        },
        "walletPath": "./local/wallets/walletFake.json",
        "bundlrNode": "https://node2.bundlr.network",
        "twitter": {
            "userIds": [
                "718916004072570880",
                "2315512764"
            ]
        },
        "keywords": [
            "Ukraine",
            "ukraine",
            "Russia",
            "russia",
            "#UkraineInvasion"
        ]
    }
]
```

__Now modify this pools.json file to generate a pool to your liking.__ we will modify 5 items above, modify only the following configs - 

1. the poolId, where it says russia-ukraine-test, this is the pool id which will be used to 
    specify which pool you are running the client for in the future, so modify this to be
    something related to your pool for example a pool for the Iraq war could be iraq-war.
2. state.title, this is the title of your pool which will display on the homepage of Alex etc...
    Modify it to a title you want.
3. state.description, this is a long description used for your pool on the site it can contain
    Text and html markup, also modify this.
4. twitter.userIds, a list of twitter uid's to track in twitter mining, this can be empty or contain
    multiple uids, modify this as well.
5. keywords, this is a list of the main keywords to track in the mining process for all mining processes.
    This is the core driving data which will tell the mining programs what to pull from twitter and wikipedia


Now run the client from within the directory containing pools.json, it requires pools.json in the current directory

```
arcpool create <poolId> --control-wallet <path to wallet.json> --image <path to image file> 
```

Example:

```
arcpool create russia-ukraine-test --control-wallet wallet.json --image background.jpg
```

__You have now created a pool, you can check the Alex site for the pool__ https://alex.arweave.dev/#/collections This will also generate a pool wallet in your current directory do not lose this wallet it is where contributions go.


