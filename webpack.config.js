const fs = require("fs");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { cwd } = require("./lib/utils");

// Our to-be-compiled entry paths
// (should pipe these in from slatest.config.json and, well tbh, object merge them all with defaults)
let entryPaths = ["./assets/app.scss", "./assets/app.es6"];

// Resolve paths properly, then strip out any that don't yet exist (as webpack bitches out)
entryPaths = entryPaths.map(e => path.resolve(cwd, e));
entryPaths = entryPaths.filter(e => fs.existsSync(e));

module.exports = {
  mode: "production",
  target: "node",
  entry: {
    // Again, probably shouldn't be forcing to app.compiled.* but yeah
    "app.compiled": entryPaths
  },
  resolve: {
    modules: [`node_modules`, `assets`],
    extensions: [`.es6`]
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
      // ES6 => JS vanilla
      {
        test: /\.es6$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css"
    })
  ]
};
