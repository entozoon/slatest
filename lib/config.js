const fs = require("fs");
const { cwd } = require("./utils");

const configRequiredKeys = ["themeId", "appPassword", "store", "port"];
const objectHasKeys = (obj, keys) =>
  keys.every(k => {
    return obj.hasOwnProperty(k);
  });

module.exports = configFilename => {
  // Load config file, and catch non-extant
  const configFile = `${cwd}/${
    configFilename ? configFilename : "slaty.config.json"
  }`;
  if (!fs.existsSync(configFile)) {
    throw new Error(
      `Please create a ${configFile} file in your project dir!\n`
    );
  }
  let configJson = JSON.parse(fs.readFileSync(configFile));
  console.log("configFile", configJson);

  if (!objectHasKeys(configJson, configRequiredKeys)) {
    throw new Error(
      `Your config file must contain the required keys: ${configRequiredKeys.join(
        ", "
      )}!\n`
    );
  }

  return configJson;
};
