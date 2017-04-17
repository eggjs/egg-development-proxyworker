'use strict';

const path = require('path');
const { forkNode } = require('./lib/utils/helper');
const proxyWorkerFile = path.join(__dirname, './', 'lib', 'proxy_worker.js');

let proxyWorker;

module.exports = app => {
  const logger = app.logger;
  const config = app.config.proxyworker;
  const env = process.env;
  const proxyPort = config.port || env.EGG_WORKER_PROXY;

  function forkProxyWorker(debugPort) {
    const args = { proxyPort, debugPort };
    if (config.ssl) {
      args.ssl = config.ssl;
    }
    logger.info('[egg-development-proxyworker] debugger attached');
    logger.info(`[egg-development-proxyworker] debugger debugPort is ${debugPort} and proxyPort is ${proxyPort}`);
    proxyWorker = forkNode(proxyWorkerFile, [ JSON.stringify(args) ], {
      execArgv: [],
    });
  }

  app.messenger.on('conn-proxy-worker', data => {
    if (proxyWorker) {
      proxyWorker.kill('SIGTERM');
    }

    forkProxyWorker(data.debugPort);
  });
};
