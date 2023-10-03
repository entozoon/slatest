import fs from "fs";
import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { cwd } from "slatest/lib/utils.js";
import * as sass from "sass";
const entryPathsDefaults = {
  "app.compiled": ["./src/scss/app.scss", "./src/es6/app.es6"],
};
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
const config = (options) => {
  console.log(":: ~ webpack options:", options);
  // Our to-be-compiled entry paths
  let entryPaths = entryPathsDefaults;
  if (options.config.entryPaths) {
    entryPaths = options.config.entryPaths;
  }
  // Resolve paths properly, then strip out any that don't yet exist (as webpack bitches out)
  for (let key in entryPaths) {
    entryPaths[key] = entryPaths[key].map((e) => path.resolve(cwd, e));
    entryPaths[key] = entryPaths[key].filter((e) => {
      if (!fs.existsSync(e)) {
        console.error("Uh oh! File from entryPaths does not exist:", e);
        return false;
      }
      return true;
    });
  }
  console.log(":: ~ entryPaths", entryPaths);
  //
  return {
    mode: "development", // overridden for build
    target: "web",
    entry: entryPaths,
    resolve: {
      modules: [path.resolve(cwd, `node_modules`), path.resolve(cwd, "assets")],
      alias: {
        svelte: path.resolve("node_modules", "svelte"),
      },
      extensions: [".es6", ".jsx", ".svelte", ".js"],
      mainFields: ["svelte", "browser", "module", "main"], // in order of priority
    },
    watch: false, // initialised later
    watchOptions: {
      ignored: /node_modules/,
    },
    output: {
      path: path.resolve(cwd, "assets"),
    },
    // Use a hidden devServer to compile stuff, for dev purposes at least, as it's more efficient (does partial compiles)
    devServer: {
      compress: false,
      open: false, // we don't actually want to see it, so..
      devMiddleware: {
        stats: "errors-only",
        //  quiet: false, // ideally true! but there are errors I can't hook into - i.e. if node is updated (causing failedModule node-sass)
        writeToDisk: true, // this is what we're here for
      },
      // Disable websocket/HMR stuff as we don't need HMR from this angle for Shopify
      webSocketServer: false,
      hot: false,
      liveReload: false,
    },
    devtool: "inline-source-map",
    // externalsType: "node-commonjs",
    // externalsPresets: { node: true },
    // externalsPresets: { web: true },
    // optimization: {
    //   namedModules: true,
    //   namedChunks: true,
    //   nodeEnv: "development",
    //   flagIncludedChunks: false,
    //   occurrenceOrder: false,
    //   sideEffects: false,
    //   usedExports: false,
    //   concatenateModules: false,
    //   splitChunks: {
    //     hidePathInfo: false,
    //     minSize: 10000,
    //     maxAsyncRequests: Infinity,
    //     maxInitialRequests: Infinity
    //   },
    //   noEmitOnErrors: false,
    //   checkWasmTypes: false,
    //   minimize: false,
    //   removeAvailableModules: false
    // },
    module: {
      rules: [
        // SCSS => CSS (Also parse CSS here, why not?)
        {
          test: /\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                // Prefer `dart-sass`
                implementation: sass,
                // Optionally silence deprecation warnings
                sassOptions: {
                  quiet: !!options["silent-scss"],
                  quietDeps: !!options["silent-scss"],
                },
              },
            },
          ],
        },
        {
          test: /\.(svelte)$/,
          // exclude: /node_modules/,
          include: /node_modules/,
          use: [
            "babel-loader",
            {
              loader: "svelte-loader",
              options: {
                // hotReload: true,
                emitCss: true,
                configFile: path.resolve(__dirname, `.babelrc`),
              },
            },
          ],
        },
        // ES6/JS/JSX => JS vanilla
        {
          test: /\.(es6|js|jsx)$/,
          // Ideally we'd want to include node_modules, so as to allow transpiling of imported ES6 modules (for IE11) but it's just. too. slow.
          // Keeping it in for this patch, for compatibility, but then the next minor bump will sack it off.
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, `.babelrc`),
          },
        },
        // Dummy compilation for README.md - a workaround for when no src entry points exist
        {
          test: path.resolve(__dirname, "README.md"),
          use: "null-loader",
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        // Use full filename include filetype from entryPaths, e.g. app.scss.compiled.css
        //
        filename: "[name].css",
      }),
    ],
  };
};
export default config;
