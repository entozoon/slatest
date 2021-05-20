const fs = require("fs");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { cwd } = require("./lib/utils");

const entryPathsDefaults = {
  "app.compiled": ["./src/styles/theme.scss"],
};

module.exports = (config) => {
  // Our to-be-compiled entry paths
  let entryPaths = entryPathsDefaults;
  if (config.entryPaths) {
    entryPaths = config.entryPaths;
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
  //console.log("entryPaths", entryPaths);

  return {
    mode: "development", // overridden for build
    target: "node",
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
      path: path.resolve(cwd, "src/assets"),
    },
    // Use a hidden devServer to compile stuff, for dev purposes at least, as it's more efficient (does partial compiles)
    devServer: {
      writeToDisk: true, // this is what we're here for
      compress: false,
      open: false, // we don't actually want to see it, so..
      quiet: false, // ideally true! but there are errors I can't hook into - i.e. if node is updated (causing failedModule node-sass)
      stats: "errors-only",
    },
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
          test: /\.(scss|css|liquid)$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: require.resolve("css-loader") , options: { url: false, importLoaders: 1 } },
            { loader: require.resolve("liquid-loader"), options: { settingsData: "../config/settings_data.json" } },
          ],
        },
        {
          test: /\.(svelte)$/,
          // exclude: /node_modules/,
          use: "svelte-loader",
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
        filename: "[name].css",
      }),
    ],
  };
};
