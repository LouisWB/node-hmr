const fs = require('fs');
const { spawnSync } = require('child_process');

/**
 * 判断路径为文件/文件夹
 * @param {String} path
 * @returns {Boolean}
 */
function _isDir(path) {
  const stat = fs.lstatSync(path);
  return stat.isDirectory();
}

/**
 *
 * @param {String} path
 * @returns {Number|undefined}
 */
function _spawnSync(path) {
  const result = spawnSync('node', [path]);
  const stdout = result.stdout.toString(); // 命令执行的标准输出
  const stderr = result.stderr.toString(); // 命令执行的标准错误
  let pid = result.pid; // pid
  process.stdout.clearLine();
  process.stdout.write(`\r ${stderr || stdout}`);
  return pid;
}

module.exports = {
  _isDir,
  _spawnSync,
};
