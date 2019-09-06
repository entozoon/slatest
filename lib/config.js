const fs = require("fs");
const { cwd } = require("./utils");

module.exports = configFilename => {
  // Load config file, and catch non-extant
  const configFile = `${cwd}/${
    configFilename ? configFilename : "slatest.config.json"
  }`;
  if (!fs.existsSync(configFile)) {
    throw new Error(`Please create a ${configFile} file in your project dir`);
  }
  console.log("configFile", configFile);
  return JSON.parse(fs.readFileSync(configFile));
};
