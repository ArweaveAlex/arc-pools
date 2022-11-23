const pm2 = require('pm2');

(async function () {
    if(process.argv.includes("--d")){
        if(process.argv[2] !== 'mine') {
            console.error("--d flag can only be used with the mine command");
            process.exit(2);
        }
        pm2.connect(function(err: any) {
            if (err) {
              console.error(err);
              process.exit(2);
            }
            pm2.start({
              script    : 'index.ts',
              name      : process.argv[3],
              args: process.argv
            }, function(err: any, _apps: any) {
              if (err) {
                console.error("Error connecting to pm2...");
                console.error(err);
                pm2.disconnect();
              } else {
                console.log("pm2 daemon process created...");
                pm2.disconnect();
              }
            });
        });
    } else {
        require('./cli');
    }
})();