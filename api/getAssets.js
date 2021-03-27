const fetch = require("node-fetch");

module.exports = config => () =>
  new Promise((resolve, reject) => {
    const apiUrlAssets = require("./apiUrlAssets")(config);
    fetch(apiUrlAssets, {
      method: "GET",
      headers: {
        "X-Store-Access-Token": config.appPassword,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then(r => {
        if (r.status == 404) {
          let errorText = r.statusText;
          return reject(`[ERROR] ${errorText}`);
        }
        return r.json();
      })
      .then(r => {
        return resolve(r.assets);
      })
      .catch(reject);
  });
