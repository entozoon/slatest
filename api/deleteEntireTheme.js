const { getAssets } = require("./getAssets");
const { remove } = require("./remove");

module.exports = () => {
  console.log(
    "\n\nThis is mad destructive - deleting all templates, assets, scheme, etc in your Shopify theme!\nAre you super duper certain? Ctrl-z out within 10 seconds to stop!\n"
  );
  setTimeout(() => {
    getAssets()
      .then(assets => {
        if (!assets.length) reject("No assets");

        console.log(
          `Deleting ${
            assets.length
          } assets. This will take approximately ${Math.ceil(
            (assets.length * 333) / 1000 / 60
          )} minutes..`
        );

        const deleteAssetsPromises = assets.map(
          (a, i) =>
            new Promise(resolve => {
              // Max 4 request/s so have a cheeky set of timeouts to pace it (#KISS)
              setTimeout(() => {
                remove(a.key)
                  .then(resolve)
                  .catch(console.error);
              }, i * 333);
            })
        );
        Promise.all(deleteAssetsPromises)
          .then(() => {
            console.log("All done!");
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, 10000);
};
