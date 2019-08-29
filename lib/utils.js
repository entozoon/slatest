const colors = require("colors");

const forwardSlashes = string =>
  string.replace(/\\\\/g, "/").replace(/\\/g, "/");

const assetKey = filepath => forwardSlashes(filepath);

// Get the project dir, with unix style line endings
const cwd = forwardSlashes(process.cwd());

const consoleColor = (color, stuff) => {
  stuff = Object.keys(stuff)
    .map(i => stuff[i][color])
    .join(" ");
  console.log(stuff);
};

const success = (...stuff) => {
  consoleColor("green", stuff);
};

const error = (...stuff) => {
  consoleColor("red", stuff);
};

module.exports = {
  forwardSlashes,
  assetKey,
  cwd,
  success,
  error
};
