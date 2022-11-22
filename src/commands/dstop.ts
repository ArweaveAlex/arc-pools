const pm2 = require('pm2');

import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS } from "../config";
import dname from "../options/source";

const displayPm2List = (list: string[]) => {
    console.log("daemon processes - ")
    list.map((proc: any) => {
        console.log(`pid: ${proc.pid}    pm_id: ${proc.pm_id}    name: ${proc.name}    status: ${proc.pm2_env.status}\n`);
    })
}

const command: CommandInterface = {
    name: CLI_ARGS.commands.dlist,
    options: [dname],
    execute: async (_args: ArgumentsInterface): Promise<void> => {
        pm2.connect(function(err: any) {
            if (err) {
              console.error(err);
              process.exit(2);
            }
            pm2.list((err: any, list: any) => {
                if (err) {
                    console.error(err);
                    pm2.disconnect();
                    process.exit(2);
                } else {
                    displayPm2List(list);
                    pm2.disconnect();
                }
            })
        });
    }
}

export default command;