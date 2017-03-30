'use strict';

module.exports = app => {
  const logger = app.logger;
  const debugPort = process.debugPort;
  // const portRegexp = /Debugger listening on .*?(\d+)/;
  logger.info('======== process.debugPort ========', debugPort);

  if (debugPort) {
    logger.info(`[egg:proxyworker] Send debugPort ${debugPort} to agent worker`);
    app.messenger.sendToAgent('conn-proxy-worker', {
      debugPort,
    });
  }
};
