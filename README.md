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

## Creating a pool for the first time

__First make a directory anywhere on your machine which will contain pool configurations and wallets. You can call the directory anything you want.__

```
mkdir alexfiles
cd alexfiles
```

__Next, create a pools.json file which will contain all pool configurations for every one of your pools.__ You will edit this file yourself and it will also be modified by the client so don't delete it unless you need a fresh start. This will be required to run the program like package.json for npm. Put the  following json into the file, note this is an example.

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


__Lastly run the client from within the directory containing pools.json, it requires pools.json in the current directory__

```
arcpool create <poolId> --control-wallet <path to wallet.json> --image <path to image file> 
```

__Example:__

```
arcpool create russia-ukraine-test --control-wallet wallet.json --image background.jpg
```

__You have now created a pool, you can check the Alex site for the pool__ https://alex.arweave.dev/#/collections yhis will also generate a pool wallet in your current directory do not lose this wallet it is where contributions go.


## Adding another pool in the future

First, copy the inside of the list from the above example json, so not the whole list just the object inside it. i.e.  "russia-ukraine-test": {...)

Next add this as another list item in your pools.json file on your computer

Then start at the step above of modifying the config to your needs and follow the rest of the creation process outlined above.

Which pool you are creating is driven by the <poolId> you feed to the CLI


## Mining artifacts into a pool

__If this a new pool someone must be able to mine, the mining process will not run without funds in the pool wallet so first go to Alex and contribute to your pool__

__Next, run the client mine command from within the directory containing pools.json.__ It can be run with multiple different options here are examples using the test pool above

Mine tweets into the test pool from above, regular mine command streams tweets for 20 seconds.
```
arcpool mine russia-ukraine-test --source twitter
```

Mine all tweets where users commented/quoted on twitter with "@thealexarchive #ukraine", this --mention-tag value can be whatever you want.
```
arcpool mine russia-ukraine-test --source twitter --method mention --mention-tag "@thealexarchive #ukraine"
```

Mine all tweets ever from a particular user for example user SBF_FTX, do not include the @ in the --username value
```
arcpool mine russia-ukraine-test --source twitter --method user --username SBF_FTX
```

Mine a single wikipedia article related to the given keywords in config
```
arcpool mine russia-ukraine-test --source wikipedia
```

## Daemon mode mining

__The above commands run a finite process which will end, 20 seconds for tweets and after 1 article for wikipedia.__ If we wish to run these forever use daemon mode by passing the --d flag to any of the above mining commands. This daemon mode is built on top of pm2.

Mine tweets into the test pool from above, still runs for 20 seconds but the daemon mode will continue restarting the program infinetly. __note the --d flag__
```
arcpool mine russia-ukraine-test --source twitter --d
```

Now we can view all the daemon mode mining processes
```
arcpool dlist
```

Output should look something like this
```
daemon processes -
pid: 0    pm_id: 0    name: russia-ukraine-test    status: running
```

And we can stop a pools daemon process by name
```
arcpool dstop --dname russia-ukraine-test
```

To view logs for your mining processes install pm2
```
npm install --global pm2
```

Then stream the logs
```
pm2 logs
```