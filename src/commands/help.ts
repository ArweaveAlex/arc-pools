import clc from "cli-color";
import figlet from "figlet";
import CLI from 'clui';

import { ArgumentsInterface, CommandInterface } from "../config/interfaces";
import { APP_TITLE, CLI_ARGS } from "../config";


const command: CommandInterface = {
    name: CLI_ARGS.commands.help,
    description: `Display help text`,
    execute: async (args: ArgumentsInterface): Promise<void> => {
        console.log(clc.magenta(figlet.textSync(APP_TITLE)));
        
        console.log(`\nUsage: arcpool ${clc.blue("[commands]")} ${clc.green("[options]")}\n`);

        const { options, commands  } = args;

        const Line = CLI.Line;
        new Line()
          .column('Options', 40, [clc.cyan])
          .column('Description', 20, [clc.blackBright] )
          .fill()
          .output();

        const opts = Array.from(options)
          .map(([_key, opt]) => {
            const arg = opt.arg ? clc['blackBright'](opt.arg) : '';
            return [`--${opt.name + ' ' + arg}`, opt.description];
        });
    
        for (let i = 0, j = opts.length; i < j; i++) {
          new Line().column(opts[i][0], 40).column(opts[i][1], 50).fill().output();
        }

        console.log('\n');

        const cmds = Array.from(commands)
            .map(([_key, cmd]) => {
                let arg = '';
                if (cmd.args && cmd.args.length > 0) {
                    for (const a of cmd.args) { 
                        arg += clc['blackBright'](`<${a}>`);
                    }
                }

                return [cmd.name + ' '  + arg, cmd.description];
            });

        new Line()
            .column('Commands', 40, [clc.green])
            .column('Description', 20, [clc.blackBright])
            .fill()
            .output();

        for (let i = 0, j = cmds.length; i < j; i++) {
            new Line().column(cmds[i][0], 40).column(cmds[i][1], 60).fill().output();
        }
    }
}

export default command;