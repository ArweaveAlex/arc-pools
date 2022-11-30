# Alex. CLI

[Alex](https://alex.arweave.dev). is a decentralized archival platform that leverages the immutable and permanent data storage of Arweave and includes a mechanism that encourages end user participation.

Users contribute to collections and they receive “artifacts” back into their wallet as they are minted. Artifacts are NFTs of items the collection is storing. Since the artifacts are stored on Arweave, they cannot be changed or removed in any way by anyone.

This repository is the client tool for creating the pools and mining artifacts.


## Requirements
`arcpool` requires NodeJS and NPM installed. 

An arweave wallet is needed for creating a collection. 
[Arweave Wallet](https://docs.arweave.org/info/wallets/arweave-wallet)
[ArConnect](https://arconnect.io)
## Installing Alex. CLI
```npm install --global arcpool```

```
Usage: arcpool [commands] [options]

Options                                 Description
--control-wallet <wallet file>          Specifies a wallet to use in the pool creation
--dname <string>                        Specifies the daemon name to stop
--image <path to image file>            Specifies an image to use for pool
--mention-tag <twitter username>        Username for twitter with --method user (do not in
--method <user or mention>              Used to pull user or mentions for twitter
--source <twitter or wikipedia>         Specifies the data source


Commands                                Description
create <pool id>                        Create a pool using pools.json
dlist                                   list all daemon mining processes
dstop <daemon name>                     Stop a daemon mining process by name
fund <pool id>                          Fun the bundlr wallet for a pool
help                                    Display help text
init <pool id>                          Initialize pools.json
mine <pool id>                          Mine artifacts for a given pool
```


## Creating pool
Create a directory for the pool configurations and wallets. Name the directory anything you want.

```mkdir alexfiles```
Change into the directory you created
```cd alexfiles```

Next, create a pools.json file using the `arcpool init` command. You will edit this file and it will also be modified by the client so do not delete it after running the create and mine commands, unless you need to start over. Run the init command with a pool id of your choosing, containing no spaces. here is an example -

```arcpool init POOL_NAME```

A pools.json file will be generated looking similar to the one below
```
{
    "POOL_NAME": {
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
            "title": "Pool Title eg. Russia Ukraine War",
            "description": "Paragraph/HTML for long pool description",
            "link": "",
            "rewards": "",
            "image": "",
            "timestamp": ""
        },
        "walletPath": "",
        "bundlrNode": "https://node2.bundlr.network",
        "twitter": {
            "userIds": [
                "twitter uid"
            ]
        },
        "keywords": [
            "keyword1"
        ],
        "twitterApiKeys": {
            "consumer_key": "",
            "consumer_secret": "",
            "token": "",
            "token_secret": ""
        }
    }
}
```

__Modify the pools.json file to generate your pool.__ Modify the following configs - 
1. `state.title` is the title of your pool.
2. `state.description` is a long description of your pool. It can contain Text and/or HTML.
3. `state.briefDescription` is a brief description of your pool. It can contain Text.
4. `twitter.userIds` is a list of twitter uid's to track in Twitter mining. This can be left empty or contain multiple uids.
5. `keywords` is a list of the main keywords to track in the mining process. This is the core driving data that instructs the mining programs of what to pull from Twitter and Wikipedia.
6. `twitterApiKeys` is for mining from Twitter. Get twitter API credentials with elevated access and enter them into `twitterApiKeys`.

__Lastly run the client from within the directory containing pools.json.__

```arcpool create <POOL_ID> --control-wallet <PATH_TO_WALLET.json> --image <PATH_TO_IMAGE>```

__Example:__

```arcpool create russia-ukraine-test --control-wallet wallet.json --image background.jpg```

If the transaction is successful, you will see a new wallet and seed phrase file in a `wallets` directory. __KEEP THESE FILES SAFE. THEY ARE FOR YOUR COLLECTIONS CONTRIBUTION AND MINING PROCESS.__
Visit https://alex.arweave.dev/#/collections to view your new pool.

__To add another pool, follow the same steps as above in the same directory with the pools.json__

## Mining artifacts into a pool

__The mining process will not run without funds in the pool wallet. In this case, go to [Alex](https://alex.arweave.dev) and contribute to your pool, wait for these funds to show in the pool wallet before proceeding.__ The pool wallet can be found in the wallets directory in the directory where you run arcpool. Check the pool via the sonar link provided at creation to see if the state has updated with the contribution.

__After contribution funds have come through, we need to fund bundlr from the pool wallet as the final step, run the arcpool fund command, then wait 20-30 minutes for the funds to come through. Check with arcpool balance, once it shows bundlr funds proceed with mining__

###### Fund bundlr from the pool wallet
```arcpool fund russia-ukrain-test```

###### Check the bundlr funds on the wallet
```arcpool balance russia-ukrain-test```

__Run the client mine command from within the directory containing pools.json. It can be run with different options:__

###### Mine tweets into the test pool from above, regular mine command streams tweets for 20 seconds.
```arcpool mine russia-ukraine-test --source twitter```

###### Mine all tweets where users commented/quoted on twitter with "@thealexarchive #ukraine", this --mention-tag value can be whatever you want.
```arcpool mine russia-ukraine-test --source twitter --method mention --mention-tag "@thealexarchive #ukraine"```

###### Mine all tweets ever from a particular user for example user SBF_FTX, do not include the @ in the --username value
```arcpool mine crypto-crunch --source twitter --method user --username SBF_FTX```

###### Mine a single wikipedia article related to the given keywords in config
```arcpool mine russia-ukraine-test --source wikipedia```



## Daemon mode mining

__The mining commands run a finite process which will end after 20 seconds for tweets and each 1 article for wikipedia.__ If we wish to run these forever use daemon mode by passing the `--d` flag to any of the above mining commands. Daemon mode is built on top of pm2.

###### Mine tweets into the pool from above, still runs for 20 seconds but the daemon mode will continue restarting the program infinetly. Note the `--d` flag.

```arcpool mine russia-ukraine-test --source twitter --d```

###### To view all the daemon mode mining processes:
```arcpool dlist```

###### Output will look similar to:
```
daemon processes -
pid: 0    pm_id: 0    name: russia-ukraine-test    status: running
```

###### Stop a pools daemon process by name:
```arcpool dstop --dname russia-ukraine-test```

###### To view logs for the mining processes install pm2:
```npm install --global pm2```

###### Stream the logs:
```pm2 logs```
