const forwardSlashes = string =>
  string.replace(/\\\\/g, "/").replace(/\\/g, "/");

const fileKey = filepath => forwardSlashes(filepath);

// Get the project dir, with unix style line endings
const cwd = forwardSlashes(process.cwd());

module.exports = {
  forwardSlashes,
  fileKey,
  cwd
};
