"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployBundle = void 0;
const clients_1 = require("../clients");
async function deployBundle(deployKey, contract, folderPath) {
    const jwk = JSON.parse(Buffer.from(deployKey, 'base64').toString('utf-8'));
    const arClient = new clients_1.ArweaveClient(jwk);
    const connectedContract = arClient.warp.contract(contract).connect(jwk);
    const result = await arClient.bundlr.uploadFolder(folderPath, {
        indexFile: 'index.html',
    });
    console.log(result.id);
    await new Promise((r) => setTimeout(r, 1000));
    await connectedContract.writeInteraction({
        function: 'setRecord',
        subDomain: '@',
        transactionId: result.id,
    });
    return result.id;
}
exports.deployBundle = deployBundle;
