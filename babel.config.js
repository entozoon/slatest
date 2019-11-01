module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-react",
    {
      targets: {
        browsers: ["> 1%", "ie >= 11"]
      }
    }
  ],
  plugins: [
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-proposal-class-properties",
    "babel-plugin-syntax-jsx",
    "inferno"
  ]
};
