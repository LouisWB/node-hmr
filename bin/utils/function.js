const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const chokidar = require('chokidar');

/**
 * 判断路径为文件/文件夹
 * @param {String} _path
 * @returns {Boolean}
 */
function _isDir(_path) {
  const stat = fs.lstatSync(_path);
  return stat.isDirectory();
}

/**
 *
 * @param {String} _path
 * @returns {Number|undefined}
 */
function _spawnSync(_path) {
  const result = spawnSync('node', [_path]);
  const stdout = result.stdout.toString(); // 命令执行的标准输出
  const stderr = result.stderr.toString(); // 命令执行的标准错误
  let pid = result.pid; // pid
  process.stdout.clearLine();
  process.stdout.write(`\r----------------divide----------------\n`);
  process.stdout.clearLine();
  process.stdout.write(`\r${stderr || stdout}`);
  process.stdout.write(`----------------divide----------------\n`);

  return pid;
}
/**
 * 判断文件是否为commonjs文件
 * @param {String} _path
 * @returns {Promise}
 */
let key_word_regex = /require\(('|")([^)]+)\1\)/g;
const ext_regex = /(.+?)(?:\.(.+))?$/;

function _judgeCommonjs(_path) {
  const _env_path = path.join(path.resolve(_path, '..'));
  const package_path = path.join(path.resolve(_env_path, 'package.json'));

  try {
    fs.accessSync(package_path, fs.constants.F_OK);
    const package_str = fs.readFileSync(package_path);
    if (!package_str) return;

    // 获得package.json文件内容
    const package_json = JSON.parse(package_str);
    if (package_json.type && package_json.type === 'module') {
      key_word_regex = null;
    } else {
      // commonjs 文件，正则匹配require
      const target_file_content = fs.readFileSync(_path, {
        encoding: 'utf8',
        flag: 'r',
      });
      // 正则匹配所有require引入地址
      const matchList = [];
      while ((match = key_word_regex.exec(target_file_content)) !== null) {
        // 判断获得的字符串是否有后缀，没有则默认加上.js
        let str = match[2];
        const ext_match = str.match(ext_regex);
        if (!ext_match[2]) {
          // 无后缀,添加默认后缀
          str += '.js';
        }

        matchList.push(path.join(_env_path, str));
      }
      _watchRequire(matchList, _path);
    }
  } catch (err) {
    // 不存在
    console.error('No Read access');
  }
}

/**
 * 监听require引入文件
 */
let require_watcher = null;
function _watchRequire(list, _path) {
  if (require_watcher) {
    require_watcher.unwatch();
    return;
  }
  require_watcher = chokidar.watch(list);
  require_watcher.on('change', () => {
    _run(_path);
  });
}

/**
 *
 * @param {String} _path
 */
let pid;
function _run(_path) {
  _judgeCommonjs(_path);
  pid = _spawnSync(_path);
}

/**
 *
 * @param {String} _path
 * @returns
 */
function _listenFileChange(_path) {
  const str = `监听中：${_path}`;
  _loading(str);
  return () => {
    _loading(`监听中：${_path}`);
    try {
      process.kill(pid, 0);
    } catch (err) {
      if (err.code === 'ESRCH') {
        pid = _spawnSync(_path);
      } else {
        throw err;
      }
    }
  };
}

/**
 *
 * @param {String} _text
 */
const loadList = ['\\', '|', '/', '-'];
let times = 0;
let timer = null;
function _loading(_text) {
  clearInterval(timer);
  timer = setInterval(() => {
    process.stdout.write(`\r ${loadList[times++ % 4]} ${_text}`);
  }, 100);
}

module.exports = {
  _isDir,
  _spawnSync,
  _listenFileChange,
  _loading,
  _run,
};
