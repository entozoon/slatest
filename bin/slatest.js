import { forwardSlashes, cwd, info, error } from "../lib/utils.js";
import configImport from "../lib/config.js";
import upload from "../api/upload.js";
import remove from "../api/remove.js";
import deleteEntireTheme from "../api/deleteEntireTheme.js";
import uploadEntireTheme from "../api/uploadEntireTheme.js";
import globToRegExp from "glob-to-regexp";
import webpackConfigImport from "slatest/webpack.config.js";
import open from "open";
import soundEffects from "node-sound-effects";
import chokidar from "chokidar";
import browserSync from "browser-sync";
import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import optionsImport from "command-line-args";
const options = optionsImport([
  { name: "config", alias: "c", type: String },
  { name: "livereload", alias: "l", type: Boolean },
  { name: "build", alias: "b", type: Boolean },
  { name: "delete-entire-theme", alias: "d", type: Boolean },
  { name: "upload-entire-theme", alias: "u", type: Boolean },
  { name: "sound-effects", alias: "s", type: Boolean },
  { name: "silent-scss", alias: "i", type: Boolean },
]);
const config = configImport(options.config);
const webpackConfig = webpackConfigImport({ ...config, options });
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
  "templates",
];

// Watch everything within validDirs, by default
config.watch = config.watch || validDirs.map((d) => `${d}/**/*`);

// Ignore key files by default
config.ignore = config.ignore || [
  "config/settings_data.json",
  "templates/index.liquid",
  "templates/index.json",
];

// Ignore node_modules, nae matter what
config.ignore.push("node_modules/**");

// Ignore webpack/react HMR
config.ignore.push("**/*.hot-update.*");

// Ignore pesky DS_Stores
config.ignore.push("**/*.DS_Store");

// Ignore pesky LICENSE files
config.ignore.push("**/*.LICENSE.txt");

// Handle CLI arguments, if any
if (options["delete-entire-theme"]) {
  deleteEntireTheme(config);
} else if (options["upload-entire-theme"]) {
  uploadEntireTheme(config);
} else if (options["build"]) {
  webpackConfig.mode = "production";
  // Webpack instance
  const webpack = Webpack(webpackConfig);
  webpack.run((r) => {
    console.log("Webpack build complete!");
  });
} else {
  const target = `https://${config.store}/?key=${config.appPassword}&preview_theme_id=${config.themeId}`;
  if (options["livereload"]) {
    // Local serve
    browserSync.init({
      proxy: {
        target,
        middleware: (req, res, next) => {
          // pb=0  Hide preview bar
          // _fd=0 Prevent forwarding from localhost -> custom domain
          req.url += (req.url.includes("?") ? "&" : "?") + "pb=0&_fd=0";
          next();
        },
      },
      // https: true // moot, as is infered from proxy
      reloadDelay: 1000, // doesn't work without this. No idea why! We need a beefy one regardless, as Shopify is slow
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
          },
        },
      },
    });
  } else {
    open(target);
  }

  // Webpack instance
  const webpack = Webpack(webpackConfig);

  // // Webpack - compile SCSS/JS/etc on change, through webpack watch
  // webpack.watch(
  //   {
  //     aggregateTimeout: 500,
  //     poll: false,
  //     skipInitialEmit: true, // PR, not ready - https://github.com/webpack/webpack/issues/9730
  //     ignored: /node_modules/
  //   },
  //   (err, stats) => {
  //     // Object.keys(stats.compilation.assets).map(name => {
  //     //   console.log(name);
  //     // });
  //     if (err) error(err);
  //     if (stats.hasErrors()) {
  //       error(
  //         stats.toString({
  //           chunks: false,
  //           colors: true
  //         })
  //       );
  //     }
  //   }
  // );

  // Webpack dev server - wrangled to compile and output SCSS/JS/etc on change (more efficient for dev)
  const server = new WebpackDevServer(webpackConfig.devServer, webpack);
  // We need to specify a port in a more intelligent way really, or retry until it finds one, even though it's a hidden service
  // server.listen(config.port ? config.port + 100 : 8989, "127.0.0.1", () => {});
  // Listen is deprecated, so use start instead
  // Port is passed via webpacConfig now I reckon but sack it off for now as it only matters when running multiple projects which is rare
  server.start();

  // Watch - file changed notification
  webpack.hooks.watchRun.tapAsync("changeMessage", (_compiler, done) => {
    const changedTimes = _compiler.modifiedFiles;
    if (!changedTimes) return done();
    const changedFiles = Object.keys(changedTimes)
      .map((file) => `\n  ${file}`)
      .join("");
    if (changedFiles.length) {
      info(
        `${"[compile]".padEnd(9)} ${forwardSlashes(changedFiles.trim()).replace(
          cwd,
          ""
        )}`
      );
    }
    return done();
  });

  // Webpack error sound effect (e.g. syntax errors)
  webpack.hooks.afterCompile.tapAsync("catching-errors", ({ errors }, done) => {
    if (errors.length) {
      options["sound-effects"] && soundEffects.play("error");
      // It'll get textually output regardless, but..
      errors.forEach((err) => {
        if (err.error && err.error.name) {
          error(`${"[error]".padEnd(9)} ${err.error.name}`);
        }
      });
    }
    return done();
  });

  // Watch - upload and browser refresh
  chokidar
    .watch(config.watch, {
      ignored: (path) => {
        // https://github.com/paulmillr/chokidar/issues/773#issuecomment-504778962
        // return config.ignore.some(s => path.includes(s))
        // https://github.com/fitzgen/glob-to-regexp#usage
        return globToRegExp(`{${config.ignore.join(",")}}`, {
          extended: true,
        }).test(path);
      },
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
      },
    })
    .on("all", (event, path) => {
      path = forwardSlashes(path);
      const pathSplit = path.split("/");
      if (pathSplit <= 1 || !validDirs.includes(pathSplit[0])) return; // ignore

      info(`[${event}]`.padEnd(9), path);
      switch (event) {
        case "add":
        case "change":
          options["sound-effects"] && soundEffects.play("change");
          upload(config, path)
            .catch((err) => {
              options["sound-effects"] && soundEffects.play("error");
              error(err);
            })
            .then(() => {
              options["sound-effects"] && soundEffects.play("upload");
              options["livereload"] && browserSync.reload();
            }); // <- Could target different filetypes depending on the event..
          break;
        case "unlink":
          remove(config, path).catch((err) => {
            options["sound-effects"] && soundEffects.play("error");
            error(err);
          });
          break;
        case "default":
          console.log(
            `Currently no handler for ${event} events, but don't worry about it.`
          );
          break;
      }
    });
}
