module.exports = {
  plugins: [
    // Instanciate the plugin up in here https://github.com/zeit/next-plugins/issues/140#issuecomment-382373663
    require("autoprefixer")({
      grid: true,
      overrideBrowserslist: ["last 2 versions"]
    })
  ]
};
