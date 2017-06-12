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

由于在开发阶段，当我们修改代码并保存后，应用会自动重启 worker。但是每次 worker 的更新都会使得调试端口发生变化，而 [VSCode] 是需要 attach 到固定的调试端口的。于是我们启用了一个叫 `proxyworker` 的代理服务，worker 的调试信息会被代理到这个服务上。这样 [VSCode] 通过固定 attach 到 proxyworker 来调试 worker 了。

下面是安装使用步骤:

##### 1. 安装 [egg-development-proxyworker](https://github.com/eggjs/egg-development-proxyworker) 插件

```bash
npm i egg-development-proxyworker --save
```

##### 2. 启动插件

```js
// config/plugin.js
exports.proxyworker = {
  enable: true,
  package: 'egg-development-proxyworker',
};

// config/config.default.js
// 如果10086被占用，你可以通过这个配置指定其他的端口号
exports.proxyworker = {
  port: 10086,
};
```

##### 3. 在 `.vscode/launch.json` 添加调试配置:

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
由于 V8 Debugger [Legacy Protocol] 会在 Node.js 8.x 后被移除, 而替换使用的是 [Inspector Protocol]

新的协议主要有三大优势:
1. 支持非常大的 JavaScript 对象
2. 支持 ES6 Proxy
3. 支持 Source Map 更好

当你的 Node.js 版本大于 7.x 时，可以使用 [Inspector Protocol] 进行调试。

在上面的调试配置中需要修改一些参数来开启新协议:
- `Launch Egg` 调整参数 `"runtimeArgs": ["run", "debug"]`
- `Attach Worker` 添加参数 `"protocol": "inspector"`

此外，如果使用新协议还可以通过 chrome devtools 进行调试, 调试地址：
```
chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:10087
```


##### 4. 开始调试

在 [VSCode] 中，切换到调试页面。选择 Debug Egg 配置进行启动。

更多 VSCode Debug 用法可以参见文档: [Node.js Debugging in VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)

## 问题和建议

请在 [这里](https://github.com/okoala/egg-development-proxyworker/issues) 创建 issue 告诉我们。

## License

[MIT](LICENSE)

[VSCode]: https://code.visualstudio.com
[Legacy Protocol]: https://github.com/buggerjs/bugger-v8-client/blob/master/PROTOCOL.md
[Inspector Protocol]: https://chromedevtools.github.io/debugger-protocol-viewer/v8
