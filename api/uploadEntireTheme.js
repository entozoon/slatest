const fetch = require("node-fetch");
const fs = require("fs");
const md5 = require("md5");
const globby = require("globby");
const { success, error } = require("../lib/utils");
//
const generateChecksum = (filepath) => {
  // Store's generated checksums are md5 based on utf8 file contents
  const contents = fs.readFileSync(filepath);
  if (!contents) return null;
  return md5(contents);
};
const prepareAssets = (assetKeys) =>
  assetKeys.map((key) => {
    return {
      key,
      checksum: generateChecksum(key),
    };
  });
module.exports = (config) => () => {
  const upload = require("./upload")(config);
  globby(config.watch, {
    ignore: config.ignore,
  })
    .then((assetKeys) => {
      // Similar to deleteEntireTheme, pacing it all out simplistically
      if (!assetKeys.length) reject("No assets");
      const assetsLocal = prepareAssets(assetKeys);
      // console.log("assetsLocal", assetsLocal);
      //const apiUrlAssets = require("./apiUrlAssets")(config);
          let assetsChanged = [];
          /* assetsLocal.filter((assetLocal) => {
            //console.log(assetLocal)
            return !assetsOnline.find((assetOnline) => {
              return (
                assetLocal.key == assetOnline.key &&
                assetLocal.checksum == assetOnline.checksum
              );
            });
          });*/
          // console.log("Matches???", assetsChanged);
          console.log("Assets local", assetsLocal.length);
          
          console.log(
            "(If lots get stuck as changed, consider running delete-entire-theme and trying again, as checksums were only added late 2020. That said, there may be a few malingerers regardless)"
          );
          console.log(
            `\nUploading ${
              assetsLocal.length
            } assets. This will take approximately ${Math.ceil(
              (assetsLocal.length * 500) / 500 / 60
            )} minutes..\n\nPlease note, it will not upload theme settings and data schema!\n`
          );
          const uploadAssetsPromises = assetsLocal.map(
            (a, i) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  upload(a.key)
                    .then(resolve)
                    .catch((e) => {
                      e.name = a.name;
                      error(e);
                    });
                  // Store API call rates keep bloody changing, apparently now 4/s max
                }, i * 500);
              })
          );
          Promise.all(uploadAssetsPromises)
            .then(() => {
              success("All done!");
            })
            .catch(error);
        });

};
