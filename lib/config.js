const fs = require("fs");
const { cwd } = require("./utils");

// Load config file, and catch non-extant
const configPath = `${cwd}/slatest.config.json`;
if (!fs.existsSync(configPath)) {
  throw new Error(
    "Please create a slatest.config.json file in your project dir"
  );
}
module.exports = {
  config: JSON.parse(fs.readFileSync(configPath))
};
