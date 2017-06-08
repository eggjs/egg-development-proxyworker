'use strict';

const WebSocket = require('ws');
const http = require('http');
const EventEmitter = require('events');
const logger = require('./utils/console');

// inspire from
// https://github.com/muzuiget/node-inspector-proxy/blob/master/lib/ProxyServer.js

class WSProxy extends EventEmitter {
  constructor(options) {
    super();
    this.port = options.port;
    this.target = options.target;
    this.buffers = [];

    this.clientSockets = new Set();
    this.serverSockets = new Set();
    this.clientSocketConnected = false;
    this.serverSocketConnected = false;

    this.finalUrl = `chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${this.target.host}:${this.port}`;

    this.createServer();
  }

  getDebuggerUrl(callback) {
    const url = `http://${this.target.host}:${this.target.port}/json`;
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => {
        data = data + chunk;
      });
      res.on('end', () => {
        const info = JSON.parse(data)[0];
        callback(info.webSocketDebuggerUrl);
      });
    }).on('error', err => {
      logger.error(`Error: ${err.message}`);
      this.closeSockets();
    });
  }

  createServer() {
    if (this._server) {
      return;
    }
    this._server = new WebSocket.Server({
      port: this.port,
    });
    logger.info('[egg-development-proxyworker][ws] debugger listen at %s', this.port);
    logger.info(`[egg-development-proxyworker][ws] ${this.finalUrl}`);
    this._server.on('connection', this._socketHandler.bind(this));
    this._server.on('error', this._onError.bind(this));
  }

  closeServer(done) {
    if (this._server) {
      this.closeSockets();

      this._server.close(() => {
        logger.info(`[egg-development-proxyworker][ws] debugger port ${this.port} had closed.`);
        this._server = null;
        done();
      });
    } else {
      done();
    }
  }

  closeSockets() {

  }

  createServerSockets(serverSocket, req) {
    this.serverSocket = serverSocket;
    this.serverSocketConnected = true;
    this.serverSockets.add(this.serverSocket);

    logger.info(`[egg-development-proxyworker][ws] upgrade req url ${req.url}`);

    serverSocket.on('message', data => {
      if (this.clientSocketConnected) {
        try {
          this.clientSocket.send(data);
        } catch (error) {
          this.emit('error', error);
        }
      } else {
        this.buffers.push(data);
      }
    });

    serverSocket.on('error', error => {
      this.serverSocketConnected = false;
      !this.clientSocket.destroyed && this.clientSocket.close(error);
      logger.error('[egg-development-proxyworker][ws] debugger socket error', error);
      this.emit('error', error);
    });

    serverSocket.on('close', error => {
      logger.info('[egg-development-proxyworker][ws] debugger socket closed.');
      this.serverSockets.has(this.serverSocket) && this.serverSockets.delete(this.serverSocket);
      this.emit('close', error);
    });
  }

  createClientSockets(url) {
    logger.info('[egg-development-proxyworker][ws] create client connection socket ing...');
    this.clientSocketConnected = false;
    const clientSocket = this.clientSocket = new WebSocket(url);

    clientSocket.on('open', () => {
      logger.info('[egg-development-proxyworker][ws] client socket started.');
      this.clientSocketConnected = true;
      this.clientSockets.add(clientSocket);
      try {
        this.buffers.forEach(buffer => {
          clientSocket.send(buffer);
        });
      } catch (error) {
        clientSocket.close();
      }
      this.buffers = [];
    });

    clientSocket.on('message', data => {
      if (this.serverSocketConnected) {
        try {
          this.serverSocket.send(data);
        } catch (error) {
          this.emit('error', error);
        }
      }
    });

    clientSocket.on('error', () => {
      this.clientSocketConnected = false;
      logger.error(`[egg-development-proxyworker] could not connect to client at host ${this.target.host}:${this.target.port}`);
    });

    clientSocket.on('close', error => {
      logger.info('[egg-development-proxyworker] client socket closed.');
      this.clientSockets.has(clientSocket) && this.clientSockets.delete(clientSocket);
      this.emit('close', error);
    });
  }

  closeServerSockets() {
    for (const socket of this.serverSockets) {
      !socket.destroyed && socket.close();
    }
  }

  closeClientSockets() {
    for (const socket of this.clientSockets) {
      !socket.destroyed && socket.close();
    }
  }

  _socketHandler(serverSocket, req) {
    logger.info(`[egg-development-proxyworker][ws] receive new socket connection from ${req.connection.remoteAddress}:${req.connection.remotePort}`);

    this.createServerSockets(serverSocket, req);
    this.getDebuggerUrl(debuggerUrl => {
      if (!debuggerUrl) {
        const wsUrl = `ws://${this.target.host}:${this.target.port}/${this.port}`;
        const msg = `[egg-development-proxyworker][ws] Error: a devTools has connected to ${wsUrl}`;
        logger.error(msg);
        this.closeSockets();
        return;
      }
      this.createClientSockets(debuggerUrl);
    });
  }

  _onError(err) {
    logger.error(err);
    this._server.emit('error', err);
  }
}

module.exports = WSProxy;
