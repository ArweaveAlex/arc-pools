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
              exitProcess("Failed to connect to pm2", 1);
            }
            pm2.stop(dname, function(err2: any) {
                if (err2) {
                    console.error("Process not found...");
                    pm2.disconnect();
                } else {
                    pm2.delete(dname, function(err3: any) {
                        if (err3) {
                            console.error(err3);
                            pm2.disconnect();
                        } else {
                            console.log(`pm2 daemon process stopped and removed -- ${dname}`);
                            pm2.disconnect();
                        }
                    });
                }
            });
        });
    }
}

export default command;