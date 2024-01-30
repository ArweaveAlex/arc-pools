# Artifact Source Bounty

Steps to create your own mining source that can be used to mine artifacts on [Alex](https://alex.arweave.dev/#/). We are paying out bounties of up to $30 AR for successful mining source implementation and documentation.

Here are the steps to search for suitable mining sources and implement them into the Alex CLI: [arc-pools](https://github.com/ArweaveAlex/arc-pools).

## Tips to consider when checking out potential artifact sources 🤔

- [ ] Availability of a web API: An API is an interface provided by platforms like Twitter, which allows for external applications to interact with their data.
- [ ] It is best if the API output is available in HTML or JSON to utilize existing Alex tooling.
- [ ] Large number of API requests for free (~100 a day minimum).
- [ ] Full content can be accessed for free.
- [ ] Legally allowed to archive source content (review terms of use of source).

The goal of this bounty is to modify the Alex miner available in the [arc-pools repository](https://github.com/ArweaveAlex/arc-pools) to add a new mining source.

## Steps needed to run/modify arc-pools on your local machine 🧑‍💻

### Prerequisites

- [NodeJS (v18)](https://nodejs.org/)
- [NPM](https://www.npmjs.com/) and [Git](https://git-scm.com/) installed.

### Clone repository and checkout a new branch:

1. Fork arc-pools on [GitHub](https://github.com/ArweaveAlex/arc-pools/fork).
2. `git clone <url_of_the_forked_repo>`
3. `git checkout <new-branch>`

### Modify arc-pools source code

1. Add a new source to the mine command.

   a. Open `src/helpers/config.ts`, add in to the section that defines `CLI_ARGS.sources`

   ```typescript
   sources: {
       ...,
       yourNewSource: {
           name: 'yourNewSource'
       }
   },
   ```

   b. Open `src/command/mine.ts`, modify the switch statement to handle your new source:

   ```typescript
   switch (source) {
       ... rest of the switch statement
       case CLI_ARGS.sources.yourNewSource.name:
           console.log('Mining new source');
           return;
       case CLI_ARGS.sources.all.name:
           await all.run(poolConfig);
           return;
       default:
           exitProcess(`Source Not Found`, 1);
   }
   ```

2. Add a new miner.

   a. Copy the `src/miners/wikipedia` directory into a new directory `src/miners/yourNewSource`.

   b. Remove the file `src/miners/yourNewSource/index.ts`.

   c. Open `src/miners/yourNewSource/miner.ts` and edit the code:

   ```typescript
   import { PoolClient, PoolConfigType } from 'arcframework';
   import { log } from '../../helpers/utils';

   export async function run(poolConfig: PoolConfigType) {
   	const poolClient = new PoolClient({ poolConfig });
   	log(`Mining Your new source...`, 0);
   }
   ```

   d. Now open `src/commands/mine.ts` and import your new miner:

   ```typescript
   import * as yourNewMiner from '../miners/yourNewSource/miner';
   ```

   d. And edit the switch case you added earlier to call the miner:

   ```typescript
   case CLI_ARGS.sources.yourNewSource.name:
       yourNewMiner.run(poolConfig);
       return;
   ```

## Test new source ⛏️

1. First, create a new pool if you have not already:

   ```bash
   ts-node src/index.ts init yourNewPool
   ```

2. Configure the pool as described [here](https://alex.arweave.dev/#/docs/creating-a-pool/pool-creation-cli).

3. Now create the pool:

   ```bash
   create yourNewPool --control-wallet <PATH_TO_WALLET.json>
   ```

4. Now run the miner against your new pool:

   ```bash
   ts-node src/index.ts mine <pool_id> --source yourNewSource
   ```

   You should see your output from within the `miner.ts` file. Now you should modify `miner.ts` to pull data from an external API of your choosing and push it to Alex. View the other `miner.ts` files for examples on pushing the data to Arweave/Alex. The main facility provided by arc-pools currently for doing this is the `createAsset` function. Import it and call it in your miner with the data you would like to upload. For uploading many assets, call it in a loop with different assets.

   ```typescript
   import { createAsset } from '../../api';
   ```

5. Check TX output from CLI in [Sonar](https://sonar.warp.cc/#/app/contracts?network=mainnet&dre=dre1).

**Push your code to your Fork when ready. To collect a bounty, your source must take assets from an external source of your choosing and successfully push them to Alex. Also your source API and code will have to be approved by the team which will be indicated by an approved and merged PR.**

## Upon successful implementation 🙌

1. Open a pull request in arc-pools from your fork.
2. Drop a link to the PR in the feature-requests channel of our [Discord](http://discord.gg/2uZsWuTNvN)
3. Please give us 5-10 days to review and test the mining source.

## If your PR is approved to merge you will Collect your bounty 🤑

- If your pull request is implemented in arc-pools (Alex-Alex Archive) will message you on Discord about sending your reward.
