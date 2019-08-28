const chokidar = require("chokidar");
const browserSync = require("browser-sync");
const { config } = require("../lib/config");
const { forwardSlashes, cwd } = require("../lib/utils");
const { upload } = require("../lib/upload");
const { remove } = require("../lib/remove");

// Catch init from wrong dir
if (cwd.includes("node_modules")) {
  throw new Error(
    "Use from project directory, not directly within node_modules"
  );
}

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

console.log(config.watch);
console.log(cwd);

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
      remove(path).catch(console.error);
    } else {
      console.log(
        "Currently no handler for",
        event,
        "events, but don't worry about it."
      );
    }
  });
