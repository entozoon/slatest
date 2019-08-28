const fetch = require("node-fetch");
const fs = require("fs");
const { config } = require("../lib/config");
const { apiUrlAssets } = require("./apiUrlAssets");
const { assetKey } = require("../lib/utils");

const upload = filepath =>
  new Promise((resolve, reject) => {
    fetch(apiUrlAssets, {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": config.appPassword,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        asset: {
          key: assetKey(filepath),
          attachment: Buffer.from(fs.readFileSync(filepath), "utf-8").toString(
            "base64"
          )
        }
      })
    })
      .then(r => {
        // R eject if it borks straight away
        if (!r.status || r.status != 200) {
          let errorText = r.statusText;
          if (r.status == 404) {
            // This should be a proper dir check really..
            errorText =
              "Couldn't find appropriate place within Shopify. Is your directory definitely one of these:\nlayout, templates, sections, snippets, assets, config, locales ?";
          }
          return reject(`[ERROR] ${errorText}`);
        }
        return r.json();
      })
      .then(r => {
        console.log("[uploaded]", filepath);
        // Reject if there's a more shopify-y error, such as missing liquid tags
        if (r.errors) return reject(r.errors);
        return resolve(r);
      })
      .catch(reject);
  });

module.exports = {
  upload
};
