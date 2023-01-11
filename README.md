# Alex. CLI

[Alex](https://alex.arweave.dev). is a decentralized archival platform that leverages the immutable and permanent data storage of Arweave and includes a mechanism that encourages end user participation.

Users contribute to pools and they receive “artifacts” back into their wallet as they are minted. Artifacts are NFTs of items the pool is storing. Since the artifacts are stored on Arweave, they cannot be changed or removed in any way by anyone.

This repository is the client tool for creating the pools and mining artifacts.


## Requirements
`arcpool` requires NodeJS/NPM and Git installed. 
[NodeJS](https://nodejs.org/en/download/)
[Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

An arweave wallet is needed for creating a pool, create one and download the .json wallet file. 
[Arweave Wallet](https://docs.arweave.org/info/wallets/arweave-wallet)
[ArConnect](https://arconnect.io)

## Installing Alex. CLI
```npm install --global arcpool```

```
Usage: arcpool [commands] [options]

Options                                 Description
--clear                                 Clear local search index for pool
--content-moderation                    Use content moderation on twitter mining
--control-wallet <wallet file>          Specifies a wallet to use in the pool creation
--dname <string>                        Specifies the daemon name to stop
--image <path to image file>            Specifies an image to use for pool
--mention-tag <twitter username>        Username for twitter with --method user (do not include @ or #)
--method <user or mention>              Used to pull user or mentions for twitter
--source <twitter or wikipedia>         Specifies the data source


Commands                                Description
balance <pool id>                       Check the Bundlr and Arweave balance for the pool wallet
create <pool id>                        Create a pool using pools.json
dlist                                   list all daemon mining processes
dstop <daemon name>                     Stop a daemon mining process by name
fetch <pool id>                         Fetch pool artifacts for search
fund <pool id>                          Fun the bundlr wallet for a pool
help                                    Display help text
init <pool id>                          Initialize pools.json
mine <pool id>                          Mine artifacts for a given pool
sindex <pool id>                        Index artifacts for search
```


## Creating pool
Create a directory for the pool configurations and wallets. Name the directory anything you want.

```mkdir alexfiles```
Change into the directory you created
```cd alexfiles```

Next, create a pools.json file using the `arcpool init` command. You will edit this file and it will also be modified by the client so do not delete it after running the create and mine commands, unless you need to start over. Run the init command with a POOL_ID of your choosing, containing no spaces. Here is an example -

In this guide POOL_ID refers to a string of your choosing which will identify the pool locally for the client. It will not show up on alex it will just be used in cli commands to identify which pool you are working with. This can be changed at any time in pools.json.

```arcpool init POOL_ID```

A pools.json file will be generated looking similar to the one below
```
{
    "POOL_ID": {
        "appType": "Alex-Archiving-Pool-v1.4",
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
        ]
    }
}
```

__Modify the pools.json file to generate your pool.__ Modify the following configs - 
1. `state.title` is the title of your pool on the [Home Page](https://alex.arweave.dev) of Alex.
2. `state.description` is a long description of your pool on the [Pool Detail](https://alex.arweave.dev/#/pool/zIZXNTl-GtTDbO8eP8LpkHks5S5WhB4j82YX-N2RuGw) page of Alex. It can contain Text and/or HTML.
3. `state.briefDescription` is a brief description of your pool on the [Home Page](https://alex.arweave.dev) of Alex.
4. `keywords` is a list of the main keywords to track in the mining process. This is the core driving data that instructs the mining programs of what to pull from mining sources such as Twitter and Wikipedia.
5. `twitterApiKeys` is for mining from Twitter. Get twitter API credentials with elevated access and enter them into `twitterApiKeys`, consumer_key and consumer_secret are also referred to as API key and Secret in the twitter developer platform. token and token_secret are also referred to as Access Token and Access Token Secret in the twitter developer platform. bearer_token is referred to as Bearer Token in the twitter developer platform. You can skip putting these keys in pools.json if you don't plan to mine twitter, you can also add them later.
6. `clarifaiApiKey` if you plan to use content moderation on tweets in the mining process, you can get an api key from clarifai and put it here. This will filter out explicit content from being mined into the pool.
7. `topics` A list of more general topics the pool fits into these generate ANS110 Topic tags in the data. Examples: history, funny, humor, science.

__Lastly run the client from within the directory containing pools.json.__

###### ***note: do not include < > in your command when you run it, these are here to represent values specific to you.
```arcpool create <POOL_ID> --control-wallet <PATH_TO_WALLET.json> --image <PATH_TO_IMAGE>```

__Example:__

```arcpool create russia-ukraine-test --control-wallet wallet.json --image background.jpg```

If the transaction is successful, you will see a new wallet in a `wallets` directory, you should also have been given a seed phrase. __KEEP THE WALLET FILE SAFE. IT IS FOR YOUR POOLS CONTRIBUTION AND MINING PROCESS. ALSO WRITE DOWN THE SEED PHRASE__ Visit https://alex.arweave.dev/#/pools to view your new pool, it may take some time to show up.

__To add another pool, follow the same steps as above in the same directory with the pools.json__

## Mining artifacts into a pool

__The mining process will not run without funds in the pool wallet. In this case, go to [Alex](https://alex.arweave.dev) and contribute to your pool, wait for these funds to show in the pool wallet before proceeding.__ The pool wallet can be found in the wallets directory in the directory where you run arcpool. Check the pool via the sonar link provided at creation to see if the state has updated with the contribution.

__After contribution funds have come through, we need to fund bundlr from the pool wallet as the final step, run the arcpool fund command, then wait 20-30 minutes for the funds to come through. Check with arcpool balance, once it shows bundlr funds proceed with mining__

###### Fund bundlr from the pool wallet
###### (Note: This command will use half of the contribution amount to fund bundlr, this is the only time you need to run this command as the mining process will continually fund bundlr moving forward)
```arcpool fund <POOL_ID>```

###### Check the bundlr funds on the wallet
```arcpool balance <POOL_ID>```

__Run the client mine command from within the directory containing pools.json. It can be run with different options:__

###### Mine tweets into the pool
```arcpool mine <POOL_ID> --source twitter```

###### Mine tweets into the pool and use content moderation to filter explicit content, you must have clarifaiApiKey configured in pools.json to run this. 
```arcpool mine <POOL_ID> --source twitter```

###### Mine all tweets where users commented/quoted on twitter with "@thealexarchive #ukraine", this --mention-tag value can be whatever you want.
```arcpool mine <POOL_ID> --source twitter --method mention --mention-tag "@thealexarchive #ukraine"```

###### Mine all tweets ever from a particular user for example user SBF_FTX, do not include the @ in the --username value
```arcpool mine <POOL_ID> --source twitter --method user --username SBF_FTX```

###### Mine a single wikipedia article related to the given keywords in config
```arcpool mine <POOL_ID> --source wikipedia```



## Daemon mode mining

__The mining commands run either a finite process or in the foreground.__ If we wish to run these forever use daemon mode by passing the `--d` flag to any of the above mining commands. Daemon mode is built on top of pm2.

###### Mine tweets into the pool from above, daemon mode will continue restarting the program infinetly if it shuts down. Note the `--d` flag.

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


## Indexing a pool for search

__As a pool operator you must index your pool for the artifacts to be searchable using the search bar in Alex.__ This is done using 2 commands. If there are a lot of artifacts in the pool already the fetch command will take a while so it is recommended that you start indexing early and then keep indexing after you mine new artifacts so the program will run quickly. There is no need to index until you have already mined artifacts.

###### Fetch a pools artifacts and build local files that will be uploaded as a search index:

```arcpool fetch russia-ukraine-test```

###### To fetch while also clearing the local index to do a fresh index you can run with the --clear option:
```arcpool fetch russia-ukraine-test --clear```

__After running fetch upload the index to arweave.__

###### Upload the index to arweave:
```arcpool sindex russia-ukraine-test```

No other action is required this will populate Arweave with the search index and update your pools.json with the id of the index contract.