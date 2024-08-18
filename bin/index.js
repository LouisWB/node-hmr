#!/usr/bin/env node

const chokidar = require('chokidar');
const path = require('path');
const { _isDir, _listenFileChange, _run } = require('./utils/function');

const [args_path] = process.argv.slice(2);
const target_path = path.join(path.resolve('./'), args_path);
const exec_path = _isDir(target_path)
  ? path.join(target_path, 'index.js')
  : target_path;

_run(exec_path);

const watcher = chokidar.watch(exec_path);
watcher.on('change', _listenFileChange(exec_path));
