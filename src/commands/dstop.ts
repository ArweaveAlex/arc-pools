const pm2 = require('pm2');

import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import dname from "../options/source";
import { exitProcess } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.dstop,
    description: `Stop a daemon mining process by name`,
    options: [dname],
    args: ["daemon name"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const { dname } = args.argv;

        if(!dname) {
            exitProcess(`No process name provided...`, 1);
        }

        pm2.connect(function(err: any) {
            if (err) {
              console.error(err);
              process.exit(2);
            }
            console.log(dname);
            pm2.stop(dname, function(err: any) {
                if (err) {
                    console.error("Process not found...");
                    pm2.disconnect();
                } else {
                    console.log(`pm2 daemon process stopped -- ${dname}`);
                    pm2.disconnect();
                }
            });
        });
    }
}

export default command;