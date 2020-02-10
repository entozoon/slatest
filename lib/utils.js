const colors = require("colors");

const forwardSlashes = string =>
  string.replace(/\\\\/g, "/").replace(/\\/g, "/");

const assetKey = filepath => forwardSlashes(filepath);

// Get the project dir, with unix style line endings
const cwd = forwardSlashes(process.cwd());

const consoleColor = (color, stuff) => {
  if (typeof stuff == "string") {
    stuff = stuff[color];
  } else if (typeof stuff == "array" || typeof stuff == "object") {
    // Spread operator for some reason reckons it's an object but.. isn't
    stuff = stuff
      .map(s => {
        // Colourise if possible, sacking off object formatting in favour of colour
        s = typeof s !== "string" ? JSON.stringify(s) : s;
        return s[color];
      })
      .join(" ");
  }
  console.log(stuff);
  return "";
};

const info = (...stuff) => consoleColor("blue", stuff);

const success = (...stuff) => consoleColor("green", stuff);

const error = (...stuff) => consoleColor("red", stuff);

module.exports = {
  forwardSlashes,
  assetKey,
  cwd,
  info,
  success,
  error
};
