import minimist from "minimist";
import { PoolConfigType } from "../../types";
export declare function run(config: PoolConfigType, argv: minimist.ParsedArgs): Promise<void>;
