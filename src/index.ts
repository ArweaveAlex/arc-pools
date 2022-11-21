

const pm2 = require('pm2');

import { main } from './cli';

function processWrapper(){
    if(process.argv[5] === 'daemon'){
        pm2.connect(function(err: any) {
            if (err) {
              console.error(err)
              process.exit(2)
            }
          
            pm2.start({
              script    : 'build/cli.js',
              name      : 'arcpool',
              args: process.argv
            }, function(err: any, apps: any) {
              if (err) {
                console.error(err)
                return pm2.disconnect()
              }
          
              pm2.list((err: any, list: any) => {
                // console.log(err, list)
          
                pm2.restart('arcpool', (err: any, proc: any) => {
                  // Disconnects from PM2
                  pm2.disconnect()
                })
              })
            })
        })
    } else {
        require('./cli');
    }
    
}

processWrapper();