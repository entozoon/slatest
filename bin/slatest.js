const chokidar = require("chokidar");
const fetch = require("node-fetch");
const fs = require("fs");
const browserSync = require("browser-sync");

// Utils
const forwardSlashes = string =>
  string.replace(/\\\\/g, "/").replace(/\\/g, "/");

// Get the project dir, with unix style line endings
const cwd = forwardSlashes(process.cwd());

// Catch init from wrong dir
if (cwd.includes("node_modules")) {
  throw new Error(
    "Use from project directory, not directly within node_modules"
  );
}

// Load config file, and catch non-extant
const configPath = `${cwd}/slatest.config.json`;
if (!fs.existsSync(configPath)) {
  throw new Error(
    "Please create a slatest.config.json file in your project dir"
  );
}
const config = JSON.parse(fs.readFileSync(configPath));

const apiUrlAssets = `https://${config.store}/admin/themes/${config.themeId}/assets.json`;

const fileKey = filepath => forwardSlashes(filepath);

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
          key: fileKey(filepath),
          attachment: Buffer.from(fs.readFileSync(filepath), "utf-8").toString(
            "base64"
          )
        }
      })
    })
      .then(r => {
        // Reject if it borks straight away
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

const remove = filepath => {
  console.log("no remove function yet");
};

const getAssets = () => {
  fetch(apiUrlAssets, {
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
      upload(path).catch(console.error);
    } else if (event === "change") {
      upload(path).catch(console.error);
    } else if (event === "unlink") {
      remove(path);
    } else {
      console.log(
        "Currently no handler for",
        event,
        "events, but don't worry about it."
      );
    }
  });
