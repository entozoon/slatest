import fetch from "node-fetch";
import { success, assetKey } from "../lib/utils.js";
import apiUrlAssets from "./apiUrlAssets.js";
//
const remove = (config, filepath) =>
  new Promise((resolve, reject) => {
    fetch(`${apiUrlAssets(config)}?asset[key]=${assetKey(filepath)}`, {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": config.appPassword,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((r) => {
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
export default remove;
