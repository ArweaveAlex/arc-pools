import fs from "fs";
import clc from "cli-color";

import { PoolConfigType } from "../types";
import { validatePool } from "../validations";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS, POOLS_PATH } from "../config";

// Get pool name from argv
// Check if pool exists
// if pool exists
// Exit
// else
// Generate wallet ?
// Upload image ?
// deployNFT -> Get NFT Contract Src
// deployPool -> Get Pool Contract Src
// create Pool -> Get Pool Contract

const command: CommandInterface = {
    name: CLI_ARGS.create,
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const POOLS = JSON.parse(fs.readFileSync(POOLS_PATH).toString());

        if (!args.commandValues || !args.commandValues.length) {
            console.log(clc.red(`Pool Not Provided`));
            return;
        }

        const poolName = args.commandValues[0];

        if (!(poolName in POOLS)) {
            console.log(clc.red(`Pool Not Found`));
            return;
        }

        // Check pool already exists
        const pool: PoolConfigType = validatePool(POOLS[poolName]);

        if (pool) {
            console.log(pool);
        }
        else {
            console.log(clc.red(`Invalid Pool Configuration`));
        }
        // fs.writeFileSync(POOLS_PATH, JSON.stringify(POOLS, null, 4));
    }
}

export default command;

// class Member implements Serializable<Member> {
//     id: number;

//     deserialize(input) {
//         this.id = input.id;
//         return this;
//     }
// }

// class ExampleClass implements Serializable<ExampleClass> {
//     mainId: number;
//     firstMember: Member;
//     secondMember: Member;

//     deserialize(input) {
//         this.mainId = input.mainId;

//         this.firstMember = new Member().deserialize(input.firstMember);
//         this.secondMember = new Member().deserialize(input.secondMember);

//         return this;
//     }
// }

// var json = {
//     mainId: 42,
//     firstMember: {
//         id: 1337
//     },
//     secondMember: {
//         id: -1
//     }
// };

// var instance = new ExampleClass().deserialize(json);
// console.log(instance);