const forwardSlashes = string =>
  string.replace(/\\\\/g, "/").replace(/\\/g, "/");

const assetKey = filepath => forwardSlashes(filepath);

// Get the project dir, with unix style line endings
const cwd = forwardSlashes(process.cwd());

module.exports = {
  forwardSlashes,
  assetKey,
  cwd
};
