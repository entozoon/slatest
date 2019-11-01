const fs = require("fs");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { cwd } = require("./lib/utils");

// Our to-be-compiled entry paths
// (should pipe these in from slatest.config.json and, well tbh, object merge them all with defaults)
let entryPaths = ["./src/scss/app.scss", "./src/es6/app.es6"];

// Resolve paths properly, then strip out any that don't yet exist (as webpack bitches out)
entryPaths = entryPaths.map(e => path.resolve(cwd, e));
entryPaths = entryPaths.filter(e => fs.existsSync(e));

if (entryPaths.length === 0) {
  // If neither app.scss or app.es6 exist, sack all of webpack off by setting README as a dummy entry point
  entryPaths = `${__dirname}/README.md`;
} else {
  entryPaths = {
    // Again, probably shouldn't be forcing to app.compiled.* but yeah
    "app.compiled": entryPaths
  };
}

module.exports = {
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
        // Remove node_modules exclusion, so as to allow transpiling of imported ES6 modules (for IE11)
        // exclude: /(node_modules)/,
        loader: "babel-loader"
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
