'use strict';

module.exports = app => {
  const logger = app.logger;
  const debugPort = process.debugPort;

  if (debugPort) {
    logger.info(`[egg:proxyworker] Send debugPort ${debugPort} to agent worker`);
    app.messenger.sendToAgent('conn-proxy-worker', {
      debugPort,
    });
  }
};
