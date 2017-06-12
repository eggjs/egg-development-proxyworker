# egg-development-proxyworker

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-development-proxyworker.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-development-proxyworker
[download-image]: https://img.shields.io/npm/dm/egg-development-proxyworker.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-development-proxyworker
[travis-image]: https://img.shields.io/travis/eggjs/egg-development-proxyworker.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-development-proxyworker
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-development-proxyworker.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-development-proxyworker?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-development-proxyworker.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-development-proxyworker
[snyk-image]: https://snyk.io/test/npm/egg-development-proxyworker/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-development-proxyworker

A proxy worker for debugging worker on egg

As in development stage, when we modify the code and save, the application will automatically restart the worker. But every time the worker's updates make the debug port change, And [VSCode] is required to attach to a fixed debug port. So we enabled a proxy service called `proxyworker`. Worker debugging information will be proxied to this service. And then [VSCode] through the fixed attach to proxyworker to debug the worker

The following are the installation steps:

##### 1. Install [egg-development-proxyworker](https://github.com/eggjs/egg-development-proxyworker) plugin

```bash
npm i egg-development-proxyworker --save
```

##### 2. Enable the plugin

```js
// config/plugin.js
exports.proxyworker = {
  enable: true,
  package: 'egg-development-proxyworker',
};

// config/config.default.js
// If 10086 is occupied, you can specify the other port number through this configuration
exports.proxyworker = {
  port: 10086,
};
```

##### 3. Add debug configuration in `.vscode/launch.json` :

```js
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Egg",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": "npm",
      "windows": {
        "runtimeExecutable": "npm.cmd"
      },
      "runtimeArgs": [
        "run", "dev", "--", "--debug"
      ],
      "port": 5858
    },
    {
      "name": "Attach Agent",
      "type": "node",
      "request": "attach",
      "port": 5856
    },
    {
      "name": "Attach Worker",
      "type": "node",
      "request": "attach",
      "restart": true,
      "port": 10086
    }
  ],
  "compounds": [
    {
      "name": "Debug Egg",
      "configurations": ["Launch Egg", "Attach Agent", "Attach Worker"]
    }
  ]
}
```
As V8 Debugger [Legacy Protocol] will be removed after Node.js 8.x, And replace the use of [Inspector Protocol]

The new protocol has three major advantages:
1. Support very large JavaScript object
2. Support ES6 Proxy
3. Support Source Map better

For and **only** for Node.js >= 7.x we should use [Inspector Protocol] for debugging.

In the above debug configuration, you need to modify some parameters to open the new protocol:
- `Launch Egg` adjust the parameter `"runtimeArgs": ["run", "debug"]`
- `Attach Worker` add the parameter `"protocol": "inspector"`

In addition, if you use the new protocol can also use chrome devtools for debugging, debugging address:
```
chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:10087
```


##### 4. Start debugging

In [VSCode], switch to the debug page. Select the Debug Egg configuration to start.

More VSCode Debug usage can be found in the documentation: [Node.js Debugging in VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)

## Questions & Suggestions

Please open an issue [here](https://github.com/okoala/egg-development-proxyworker/issues).

## License

[MIT](LICENSE)

[VSCode]: https://code.visualstudio.com
[Legacy Protocol]: https://github.com/buggerjs/bugger-v8-client/blob/master/PROTOCOL.md
[Inspector Protocol]: https://chromedevtools.github.io/debugger-protocol-viewer/v8
