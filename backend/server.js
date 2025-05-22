const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;
const chalk = require('chalk');

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = cluster.isMaster
        ? chalk.bgBlue.white(`[MASTER ${process.pid}]`)
        : chalk.bgGreen.white(`[WORKER ${process.pid}]`);

    const color = {
        info: chalk.white,
        success: chalk.green,
        error: chalk.red,
        warn: chalk.yellow
    }[type] || chalk.white;

    console.log(`${prefix} ${chalk.gray(timestamp)} ${color(message)}`);
}

if (cluster.isMaster) {
    log(`Master process is running on PID ${process.pid}`, 'info');
    log(`Forking ${numCPUs} workers...`, 'info');

    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        log(`Worker ${worker.process.pid} started`, 'success');
    }

    cluster.on('exit', (worker, code, signal) => {
        log(`Worker ${worker.process.pid} exited with code ${code}`, 'error');
        const newWorker = cluster.fork();
        log(`Restarted new worker ${newWorker.process.pid}`, 'warn');
    });
} else {
    require('./index.js');
}
