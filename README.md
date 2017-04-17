# egg-development-proxyworker

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-development-proxyworker.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-development-proxyworker
[download-image]: https://img.shields.io/npm/dm/egg-development-proxyworker.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-development-proxyworker

## Info
A proxy worker for debugging worker on egg

## Install

```bash
npm i egg-development-proxyworker --save
```

```js
// config/plugin.js
exports.proxyworker = {
  enable: true,
  package: 'egg-development-proxyworker',
};
```

```js
// you can use a specify proxy port.
// config/config.default.js
exports.proxyworker = {
  port: 10086,
};
```

```javascript
// .vscode/launch.json
{
  // Use IntelliSense to learn about possible Node.js debug attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
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

## Start debugging

In vscode, switch to debugger tab and select ```Debug Egg``` run

## Questions & Suggestions

Please open an issue [here](https://github.com/okoala/egg-development-proxyworker/issues).

## License

[MIT](LICENSE)
