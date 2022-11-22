export default interface CommandInterface {
    name: string;
    options?: any[];
    execute: (args: any) => Promise<void>;
}
