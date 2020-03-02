const options = require("command-line-args")([
  { name: "config", alias: "c", type: String },
  { name: "delete-entire-theme", alias: "d", type: Boolean },
  { name: "upload-entire-theme", alias: "u", type: Boolean }
]);
const chokidar = require("chokidar");
const browserSync = require("browser-sync");
const webpack = require("webpack");
const config = require("../lib/config")(options.config);
const { forwardSlashes, cwd, info, error } = require("../lib/utils");
const upload = require("../api/upload")(config);
const remove = require("../api/remove")(config);
const deleteEntireTheme = require("../api/deleteEntireTheme")(config);
const uploadEntireTheme = require("../api/uploadEntireTheme")(config);
const globToRegExp = require("glob-to-regexp");
const webpackConfig = require("../webpack.config.js")(config);

// Catch init from wrong dir
if (cwd.includes("node_modules")) {
  throw new Error(
    "Use from project directory, not directly within node_modules"
  );
}

// Shopify has a strict folder structure: https://shopify.dev/tutorials/develop-theme-templates
const validDirs = [
  "assets",
  "config",
  "layout",
  "locales",
  "sections",
  "snippets",
  "templates"
];

// Watch everything within validDirs, by default
config.watch = config.watch || validDirs.map(d => `${d}/**/*`);

// Iggnore settings_data.json, by default
config.ignore = config.ignore || ["config/settings_data.json"];

// Ignore node_modules, nae matter what
config.ignore.push("node_modules/**");

// Handle CLI arguments, if any
if (options["delete-entire-theme"]) {
  deleteEntireTheme();
} else if (options["upload-entire-theme"]) {
  uploadEntireTheme();
} else {
  // Local serve
  browserSync.init({
    proxy: {
      target: `https://${config.store}/?key=${config.appPassword}&preview_theme_id=${config.themeId}`,
      middleware: (req, res, next) => {
        // pb=0  Hide preview bar
        // _fd=0 Prevent forwarding from localhost -> custom domain
        req.url += (req.url.includes("?") ? "&" : "?") + "pb=0&_fd=0";
        next();
      }
    },
    // https: true // moot, as is infered from proxy
    reloadDelay: 500, // doesn't work without this. No idea why! We need a beefy one regardless, as Shopify is slow
    // injectChanges: false
    logLevel: "info",
    logPrefix: "refresh",
    port: config.port ? config.port : 3030,
    // Inject magic script into the <head> rather than <body>
    // https://github.com/BrowserSync/browser-sync/issues/1718
    snippetOptions: {
      rule: {
        match: /<head[^>]*>/i,
        fn: (snippet, match) => {
          return match + snippet;
        }
      }
    }
  });

  // Webpack - compile SCSS/JS/etc on change
  const _webpack = webpack(webpackConfig).watch(
    {
      aggregateTimeout: 500,
      poll: false
    },
    (err, stats) => {
      // Object.keys(stats.compilation.assets).map(name => {
      //   console.log(name);
      // });
      if (err) error(err);
      if (stats.hasErrors()) {
        error(
          stats.toString({
            chunks: false,
            colors: true
          })
        );
      }
    }
  );

  // Watch - file changed notification
  _webpack.compiler.hooks.watchRun.tapAsync(
    "changeMessage",
    (_compiler, done) => {
      const changedTimes = _compiler.watchFileSystem.watcher.mtimes;
      const changedFiles = Object.keys(changedTimes)
        .map(file => `\n  ${file}`)
        .join("");
      if (changedFiles.length) {
        info(
          `${"[compile]".padEnd(9)} ${forwardSlashes(
            changedFiles.trim()
          ).replace(cwd, "")}`
        );
      }
      return done();
    }
  );

  // Watch - upload and browser refresh
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
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    })
    .on("all", (event, path) => {
      path = forwardSlashes(path);
      const pathSplit = path.split("/");
      if (pathSplit <= 1 || !validDirs.includes(pathSplit[0])) return; // ignore

      info(`[${event}]`.padEnd(9), path);
      switch (event) {
        case "add":
        case "change":
          upload(path)
            .catch(error)
            .then(browserSync.reload); // <- Could target different filetypes depending on the event..
          break;
        case "unlink":
          remove(path).catch(error);
          break;
        case "default":
          console.log(
            `Currently no handler for ${event} events, but don't worry about it.`
          );
          break;
      }
    });
}
