import Arweave from "arweave";

export default class GQLCLient {
    arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 40000,
        logging: false,
    })

    async getAllPools() {
        
    }
}