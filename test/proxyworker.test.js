'use strict';

const mm = require('egg-mock');
const net = require('net');
const sleep = require('ko-sleep');

describe('test/proxyworker.test.js', () => {
  describe('default config', () => {
    describe('debug protocol', () => {
      let app;

      before(() => {
        mm(process.env, 'NODE_ENV', 'development');
        app = mm.cluster({
          baseDir: 'app',
          opt: {
            execArgv: [ '--debug' ],
          },
        });
        return app.ready();
      });
      after(() => app.close());
      after(mm.restore);

      it('should debug protocol success', function* () {
        yield sleep(3000);
        app.expect('stdout', /debugger listen at 10086/);
      });

      it('should debug protocol connect success', function* () {
        app.debug();
        const socket = new net.createConnection({ port: 10086, host: '127.0.0.1' });
        yield sleep(2000);
        socket.destroy();
        yield sleep(2000);
        app.expect('stdout', /debugger socket closed/);
      });
    });

    describe('inspector protocal', () => {
      let app;

      before(() => {
        mm(process.env, 'NODE_ENV', 'development');
        app = mm.cluster({
          baseDir: 'app', opt: {
            execArgv: [ '--inspect' ],
          },
        });
        return app.ready();
      });
      afterEach(() => app.close());

      it('should inspector protocol success', function* () {
        yield sleep(5000);
        app.expect('stdout', /\[ws\] debugger listen at 10087/);
        app.expect('stdout', /\[ws\] chrome-devtools:\/\/devtools\/bundled\/inspector.html\?experiments=true&v8only=true&ws=127.0.0.1:10087/);
      });
    });

  });

  describe('custom debug port', () => {
    let app;

    beforeEach(() => {
      mm(process.env, 'NODE_ENV', 'development');
    });
    afterEach(() => app.close());

    it('should success', function* () {
      app = mm.cluster({
        baseDir: 'custom-debug-port', opt: {
          execArgv: [ '--inspect' ],
        },
      });
      yield app.ready();
      yield sleep(5000);
      app.expect('stdout', /debugger listen at 10088/);
      app.expect('stdout', /\[ws\] debugger listen at 10089/);
    });
  });
});
