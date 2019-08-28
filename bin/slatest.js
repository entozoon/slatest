const options = require("command-line-args")([
  { name: "delete-entire-theme", alias: "d", type: Boolean },
  { name: "upload-entire-theme", alias: "u", type: Boolean }
]);
const chokidar = require("chokidar");
const browserSync = require("browser-sync");
const { config } = require("../lib/config");
const { forwardSlashes, cwd } = require("../lib/utils");
const { upload } = require("../api/upload");
const { remove } = require("../api/remove");
const { deleteEntireTheme } = require("../api/deleteEntireTheme");
const { uploadEntireTheme } = require("../api/uploadEntireTheme");
const globToRegExp = require("glob-to-regexp");

// Catch init from wrong dir
if (cwd.includes("node_modules")) {
  throw new Error(
    "Use from project directory, not directly within node_modules"
  );
}

// let test = "{node_modules/**,assets/**.scss}";
// let string = "assets/something/u/d/dwa/dw/ay.scss";
// console.log(test, string, globToRegExp(test, { extended: true }).test(string));
// // true is ignore

// Handle CLI arguments, if any
if (options["delete-entire-theme"]) {
  deleteEntireTheme();
} else if (options["upload-entire-theme"]) {
  uploadEntireTheme();
} else {
  // Local serve
  browserSync.init({
    proxy: `https://${config.store}`,
    // https: true // moot, as is infered from proxy
    reloadDelay: 800, // doesn't work without this. No idea why! We need a beefy one regardless, as Shopify is slow
    // injectChanges: false
    logLevel: "info"
  });

  chokidar
    .watch(config.watch, {
      ignored: path => {
        // https://github.com/paulmillr/chokidar/issues/773#issuecomment-504778962
        // return config.ignore.some(s => path.includes(s))
        // https://github.com/fitzgen/glob-to-regexp#usage
        return globToRegExp(`{${config.ignore.join(",")}}`, {
          extended: true
        }).test(path);
      },
      ignoreInitial: true
    })
    .on("all", (event, path) => {
      path = forwardSlashes(path);
      console.log(`[${event}]`, path);
      switch (event) {
        case "add":
        case "change":
          upload(path)
            .catch(console.error)
            .then(browserSync.reload); // <- Could target different filetypes depending on the event..
          break;
        case "unlink":
          remove(path).catch(console.error);
          break;
        case "default":
          console.log(
            `Currently no handler for ${event} events, but don't worry about it.`
          );
          break;
      }
    });
}
