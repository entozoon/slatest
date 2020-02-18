const globby = require("globby");
const { success, error } = require("../lib/utils");

module.exports = config => () => {
  const upload = require("./upload")(config);
  globby(config.watch, {
    ignore: config.ignore
  })
    .then(assets => {
      // Similar to deleteEntireTheme, pacing it all out simplistically
      if (!assets.length) reject("No assets");
      console.log(
        `Uploading ${
          assets.length
        } assets. This will take approximately ${Math.ceil(
          (assets.length * 1000) / 1000 / 60
        )} minutes..\n\nPlease note, it will not upload theme settings and data schema!`
      );
      const uploadAssetsPromises = assets.map(
        (a, i) =>
          new Promise(resolve => {
            setTimeout(() => {
              upload(a)
                .then(resolve)
                .catch(e => {
                  e.name = a.name;
                  error(e);
                });
              // We were doing 3/second but Shopify have increased their limit further(!)
            }, i * 1000);
          })
      );
      Promise.all(uploadAssetsPromises)
        .then(() => {
          success("All done!");
        })
        .catch(error);
    })
    .catch(error);
};
