const fs = require("fs");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { cwd } = require("./lib/utils");

const entryPathsDefaults = {
  "app.compiled": ["./src/scss/app.scss", "./src/es6/app.es6"]
};

module.exports = config => {
  // Our to-be-compiled entry paths
  let entryPaths = entryPathsDefaults;
  if (config.entryPaths) {
    entryPaths = config.entryPaths;
  }

  // Resolve paths properly, then strip out any that don't yet exist (as webpack bitches out)
  for (let key in entryPaths) {
    entryPaths[key] = entryPaths[key].map(e => path.resolve(cwd, e));
    entryPaths[key] = entryPaths[key].filter(e => fs.existsSync(e));
  }

  return {
    mode: "production",
    target: "node",
    entry: entryPaths,
    resolve: {
      modules: [path.resolve(cwd, `node_modules`), path.resolve(cwd, `assets`)],
      extensions: [`.es6`, `.jsx`, ".js"]
    },
    watch: true,
    output: {
      path: path.resolve(cwd, "assets")
    },
    module: {
      rules: [
        // SCSS => CSS
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                config: {
                  path: __dirname
                }
              }
            },
            "sass-loader"
          ]
        },
        // ES6/JS/JSX => JS vanilla
        {
          test: /\.(es6|js|jsx)$/,
          // Ideally we'd want to include node_modules, so as to allow transpiling of imported ES6 modules (for IE11) but it's just. too. slow.
          // Keeping it in for this patch, for compatibility, but then the next minor bump will sack it off.
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, `.babelrc`)
          }
        },
        // Dummy compilation for README.md - a workaround for when no src entry points exist
        {
          test: path.resolve(__dirname, "README.md"),
          use: "null-loader"
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css"
      })
    ]
  };
};
