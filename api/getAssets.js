import fetch from "node-fetch";
import apiUrlAssets from "./apiUrlAssets.js";
//
const getAssets = (config) =>
  new Promise((resolve, reject) => {
    fetch(apiUrlAssets(config), {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": config.appPassword,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((r) => {
        if (r.status == 404) {
          let errorText = r.statusText;
          return reject(`[ERROR] ${errorText}`);
        }
        return r.json();
      })
      .then((r) => {
        return resolve(r.assets);
      })
      .catch(reject);
  });
export default getAssets;
