const chokidar = require("chokidar");
const fetch = require("node-fetch");
const fs = require("fs");
var browserSync = require("browser-sync");

const config = {};
const apiUrl = `https://${config.store}/admin/themes/${config.themeId}/assets.json`;

const forwardSlashes = string =>
  string.replace(/\\\\/g, "/").replace(/\\/g, "/");

const fileKey = filepath => forwardSlashes(filepath);

const upload = filepath => {
  let key = fileKey(filepath);
  return fetch(apiUrl, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": config.appPassword,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      asset: {
        key: fileKey(filepath),
        attachment: Buffer.from(fs.readFileSync(filepath), "utf-8").toString(
          "base64"
        )
      }
    })
  })
    .then(r => r.json())
    .then(r => {
      console.log("[uploaded]", filepath);
      return r;
    });
};

const getAssets = () => {
  const url = `https://${config.store}/admin/themes/${config.themeId}/assets.json`;
  fetch(url, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": config.appPassword,
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  })
    .then(r => {
      if (r.status == "404") {
        console.error("\n\nAPI error\n", url);
      }
      return r.json();
    })
    .then(r => {
      console.log(r);
    })
    .catch(error => console.error(error));
};

// getAssets(); // working

// Local serve
browserSync.init({
  proxy: `https://${config.store}`
  // https: true
});

chokidar
  .watch(config.watch, {
    // https://github.com/paulmillr/chokidar/issues/773#issuecomment-504778962
    ignored: path => config.ignore.some(s => path.includes(s)),
    ignoreInitial: true
  })
  .on("all", (event, path) => {
    path = forwardSlashes(path);
    console.log(`[${event}]`, path);

    if (event === "add" || event === "change") {
      upload(path);
    } else if (event === "change") {
      upload(path);
    } else if (event === "unlink") {
      delete path;
    } else {
      console.log("Currently no handler for ", event, "events");
    }
  });
