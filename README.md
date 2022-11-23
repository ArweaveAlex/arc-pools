# Alex. CLI

[Alex](https://alex.arweave.dev). is a decentralized archival platform that leverages the immutable and permanent data storage of Arweave and includes a mechanism that encourages end user participation.

Users contribute to collections and they receive “artifacts” back into their wallet as they are minted. Artifacts are NFTs of items the collection is storing. Since the artifacts are stored on Arweave, they cannot be changed or removed in any way by anyone.

## How to use

arcpool runs using NodeJS and NPM. You must have both installed on your machine for it to work.

Install Alex. CLI:

```
npm install --global arcpool
```

```
Usage: arcpool [command] [options]


Commands                                    Description
create                                      Create pool, options --pool-conf, --control-wallet, --image
mine <pool_id>                              Mine artifacts, options --pool-conf, --source, --method, --mention-tag
help                                        Print help
dlist                                       List daemon mining processes
dstop                                       Stop daemon mining process, options --dname


Options                                     Description
--source <twitter or wikipedia>             Used with command mine, mandatory, specifies mining program         
--method <mention>                          Used with command mine, optional, mines for --mention-tag value
--mention-tag <@username #something>        Used with command mine and option --method mention, value to search twitter for
--dname <pm2 daemon name>                   Used with command dstop, specifies daemon name to stop
--pool-conf <path to json file>             Used with commands create and mine, mandatory, specifies main pool config
--control-wallet <arweave wallet>           Used with command create, mandatory, path to wallet used for pool creation      
--image <path to image file>                Used with command create, path to image to upload for pool background image
```

