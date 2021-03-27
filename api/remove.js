const fetch = require("node-fetch");
const { success, assetKey } = require("../lib/utils");

module.exports = config => filepath =>
  new Promise((resolve, reject) => {
    const apiUrlAssets = require("./apiUrlAssets")(config);
    fetch(`${apiUrlAssets}?asset[key]=${assetKey(filepath)}`, {
      method: "DELETE",
      headers: {
        "X-Store-Access-Token": config.appPassword,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then(r => {
        if (!r.status || r.status != 200) {
          let errorText = r.statusText;
          return reject(
            `[ERROR] ${errorText} when deleting: ${assetKey(filepath)}`
          );
        }
        success("[deleted]", filepath);
        resolve(r);
      })
      .catch(reject);
  });
