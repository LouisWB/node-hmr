# Usage

`nhmr ${fileName}`

nodejs 热更新模块。
使用方法：在命令行中输入`nhmr ${fileName}`，其中`${fileName}`为需要热更新的文件名，例如`nhmr index.js`。

# Features

1. 热更新文件：在命令行中输入`nhmr ${fileName}`，其中`${fileName}`为需要热更新的文件名，例如`nhmr index.js`。
2. 自动重启：当文件发生变化时，自动重启服务。
3. 支持依赖文件热更新：依赖文件更新时，目标文件也会热更新，目前只支持 commonjs。

# Installation

1. 安装 nodejs。
2. 在命令行中输入`npm install nhmr`。

# License

MIT
