"use strict";
exports.__esModule = true;
var pm2 = require('pm2');
function processWrapper() {
    if (process.argv[5] === 'daemon') {
        pm2.connect(function (err) {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            pm2.start({
                script: 'build/cli.js',
                name: 'arcpool',
                args: process.argv
            }, function (err, apps) {
                if (err) {
                    console.error(err);
                    return pm2.disconnect();
                }
                pm2.list(function (err, list) {
                    // console.log(err, list)
                    pm2.restart('arcpool', function (err, proc) {
                        // Disconnects from PM2
                        pm2.disconnect();
                    });
                });
            });
        });
    }
    else {
        require('./cli');
    }
}
processWrapper();
