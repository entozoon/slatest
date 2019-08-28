const options = require("command-line-args")([
  { name: "delete-entire-theme", alias: "d", type: Boolean }
]);
const chokidar = require("chokidar");
const browserSync = require("browser-sync");
const { config } = require("../lib/config");
const { forwardSlashes, cwd } = require("../lib/utils");
const { upload } = require("../api/upload");
const { remove } = require("../api/remove");
const { deleteEntireTheme } = require("../api/deleteEntireTheme");

// Catch init from wrong dir
if (cwd.includes("node_modules")) {
  throw new Error(
    "Use from project directory, not directly within node_modules"
  );
}

// Handle CLI arguments, if any
if (options["delete-entire-theme"]) {
  deleteEntireTheme();
} else {
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
}
