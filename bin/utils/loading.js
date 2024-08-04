const loadList = ['\\', '|', '/', '-'];
let times = 0;
let timer = null;

function run(text) {
  return () => {
    process.stdout.write(`\r ${loadList[times++ % 4]} ${text}`);
  };
}

function loading(text) {
  clearInterval(timer);
  timer = setInterval(run(text), 100);
}
// export const loading = (text) => {
//   setInterval(run(text), 100);
// };

module.exports = loading;
