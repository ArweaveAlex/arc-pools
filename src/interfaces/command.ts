export default interface CommandInterface {
    name: string;
    options?: any[];
    args?: string[];
    description: string;
    execute: (args: any) => Promise<void>;
  }