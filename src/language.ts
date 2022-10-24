import { ARGS } from "./config";

export const LANGUAGE = {
    invalidArgs: () => (
        'Invalid args\nRequired args include:\n  ' +
        Object.keys(ARGS).map((key) => { return (ARGS as any)[key] }).join("\n  ")
    )
}