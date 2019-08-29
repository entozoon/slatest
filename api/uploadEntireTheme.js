const globby = require("globby");
const { config } = require("../lib/config");
const upload = require("./upload");

module.exports = () => {
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
          (assets.length * 333) / 1000 / 60
        )} minutes..`
      );
      const uploadAssetsPromises = assets.map(
        (a, i) =>
          new Promise(resolve => {
            setTimeout(() => {
              upload(a)
                .then(resolve)
                .catch(console.error);
            }, i * 333);
          })
      );
      Promise.all(uploadAssetsPromises)
        .then(() => {
          console.log("All done!");
        })
        .catch(console.error);
    })
    .catch(console.error);
};
