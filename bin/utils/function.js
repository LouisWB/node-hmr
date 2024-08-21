const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const chokidar = require('chokidar');

/**
 * 获取当前时间 yyyy-MM-dd HH:mm:ss
 * @returns {String}
 */

function _formattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const yyyy = year.toString();
  const MM = month < 10 ? '0' + month : month;
  const DD = day < 10 ? '0' + day : day;
  const HH = hours < 10 ? '0' + hours : hours;
  const mm = minutes < 10 ? '0' + minutes : minutes;
  const ss = seconds < 10 ? '0' + seconds : seconds;
  return yyyy + '-' + MM + '-' + DD + ' ' + HH + ':' + mm + ':' + ss;
}

/**
 * 判断路径为文件/文件夹
 * @param {String} _path
 * @returns {Boolean}
 */

function _isDir(_path) {
  let stat = null;
  try {
    stat = fs.lstatSync(_path);
  } catch (err) {
    throw new Error(`path ${_path} is not exist!`);
  }
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
  process.stdout.write('\n');
  process.stdout.write(
    `\r-------------------------${_formattedDate()}-------------------------\n`
  );
  process.stdout.clearLine();
  process.stdout.write(`\r${stderr || stdout}`);

  return pid;
}

/**
 * 判断文件路径是否存在
 * @param {String} _path
 */

function _hasFile(_path) {
  try {
    fs.accessSync(package_path, fs.constants.F_OK);
    return true;
  } catch (_err) {
    return false;
  }
}

/**
 * 如果为commonjs文件，识别所有依赖路径,并监听。
 * @param {String} _path
 * @param {Array} _env_path
 */

const ext_regex = /(.+?)(?:\.(.+))?$/;
function _realizeCommonjs(_path, _env_path) {
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

/**
 * 判断文件是否为commonjs文件
 * @param {String} _path
 * @returns {Promise}
 */
let key_word_regex = /require\(('|")([^)]+)\1\)/g;

function _judgeCommonjs(_path) {
  const msg = {
    commonjs: true,
    depend_hot: true,
    'packages.json': null,
    target_path: _path,
  };
  const _env_path = path.join(path.resolve(_path, '..'));
  const package_path = path.join(path.resolve(_env_path, 'package.json'));
  try {
    if (!_hasFile(package_path)) {
      _realizeCommonjs(_path, _env_path);
    } else {
      msg['packages.json'] = package_path;
      const package_str = fs.readFileSync(package_path);

      // 获得package.json文件内容
      const package_json = JSON.parse(package_str);
      if (package_json.type && package_json.type === 'module') {
        msg.commonjs = false;
        msg.depend_hot = false;
        key_word_regex = null;
      } else {
        _realizeCommonjs(_path, _env_path);
      }
    }
  } catch (_err) {
    // 不存在
    // throw new Error('package.json文件不存在');
    console.log({ _err });
  }
  console.table(msg);
}

/**
 * 监听require引入文件
 */
let require_watcher = null;
let mtimes = new Map();

function _watchRequire(list, _path) {
  if (require_watcher) {
    require_watcher.unwatch();
    return;
  }
  require_watcher = chokidar.watch(list, {
    ignoreInitial: true,
  });
  require_watcher.on('change', (path) => {
    // 获取文件最后修改时间
    const stats = fs.statSync(path);
    const mtime = stats.mtime.getTime();

    // 和存储对比,如果相同则说明重复触发
    if (mtimes.get(path) === mtime) return;
    // 更新最后修改时间存储
    mtimes.set(path, mtime);
    _run(_path);
  });
}

/**
 *
 * @param {String} _path
 */
let pid;
function _run(_path) {
  if (!pid) {
    _judgeCommonjs(_path);
  }
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
