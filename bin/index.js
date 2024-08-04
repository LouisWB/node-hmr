#!/usr/bin/env node

const chokidar = require('chokidar');
const path = require('path');
const loading = require('./utils/loading');
const { _isDir, _spawnSync } = require('./utils/function');

const [args_path] = process.argv.slice(2);
const target_path = path.join(path.resolve('./'), args_path);
const exec_path = _isDir(target_path)
  ? path.join(target_path, 'index.js')
  : target_path;

let pid = _spawnSync(exec_path);

const watcher = chokidar.watch(exec_path);
watcher.on('change', onFileChange());

function onFileChange(path) {
  const str = `监听中：${exec_path}`;
  loading(str);
  return (path) => {
    loading(`监听中：${exec_path}`);

    try {
      process.kill(pid, 0);
    } catch (err) {
      if (err.code === 'ESRCH') {
        pid = _spawnSync(exec_path);
      } else {
        throw err;
      }
    }
  };
}
