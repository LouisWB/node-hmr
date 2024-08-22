#!/usr/bin/env node

const chokidar = require('chokidar');
const path = require('path');
const {
  _isDir,
  _listenFileChange,
  _run,
  _judgePath,
} = require('./utils/function');

const [args_path] = process.argv.slice(2);

// 传入参数不是路径则不执行监听操作
if (!_judgePath(args_path)) return;

const target_path = path.join(path.resolve('./'), args_path);
let exec_path;
try {
  exec_path = _isDir(target_path)
    ? path.join(target_path, 'index.js')
    : target_path;
} catch (error) {
  console.log(error);
  return;
}

_run(exec_path);

const watcher = chokidar.watch(exec_path);
watcher.on('change', _listenFileChange(exec_path));
