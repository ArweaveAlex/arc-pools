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
arcpool help
```

```
Usage: arcpool [command] [options]

Options                             Description
--source                            
--method                            
--mention-tag                       
--dname                             
--pool-conf                          
--control-wallet                     
--image                             


Commands                            Description
create                              Create pool
mine <pool_id>                      Mine artifacts
help                                Print help
dlist                               List daemon mining processes
dstop                               Stop daemon mining process
```

## Contributing

1.  Create a fork
2.  Create your feature branch: `git checkout -b my-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request 🚀