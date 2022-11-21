
let esbuild = require('esbuild')
let { nodeExternalsPlugin } = require('esbuild-node-externals')

Promise.all([
    esbuild.build({
        entryPoints: ['./src/contracts/NFT/contract.ts'],
        outfile: 'build/contracts/NFT/contract.js',
        minify: false,
        // format: 'iife',
        platform: 'browser',
        sourcemap: false,
        sourcesContent: false,
        target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
        plugins: [nodeExternalsPlugin()],
    }),
    esbuild.build({
        entryPoints: ['./src/contracts/pool/contract.ts'],
        outfile: 'build/contracts/pool/contract.js',
        minify: false,
        // format: 'iife',
        platform: 'browser',
        sourcemap: false,
        sourcesContent: false,
        target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
        plugins: [nodeExternalsPlugin()],
    }),
]).catch(error => {
    console.error(error)
    process.exit(1)
})