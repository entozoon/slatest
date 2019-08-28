const fetch = require("node-fetch");
const fs = require("fs");
const { config } = require("../lib/config");
const { apiUrlAssets } = require("./apiUrlAssets");
const { assetKey } = require("../lib/utils");

const remove = filepath =>
  new Promise((resolve, reject) => {
    fetch(`${apiUrlAssets}?asset[key]=${assetKey(filepath)}`, {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": config.appPassword,
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
        console.log("[deleted]", filepath);
        resolve(r);
      })
      .catch(reject);
  });

module.exports = {
  remove
};
