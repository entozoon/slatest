import { success, error } from "../lib/utils.js";
import getAssets from "./getAssets.js";
import remove from "./remove.js";

const deleteEntireTheme = (config) => {
  const { apiSpeed } = config;
  console.log(
    "\n\nThis is mad destructive - deleting all templates, assets, scheme, etc in your Shopify theme!\nAre you super duper certain? Ctrl-z out within 10 seconds to stop!\n"
  );
  setTimeout(() => {
    getAssets(config)
      .then((assets) => {
        if (!assets.length) reject("No assets");

        console.log(
          `Deleting ${
            assets.length
          } assets. This will take approximately ${Math.ceil(
            (assetsChanged.length * apiSpeed) / 1000 / 60
          )} minutes..`
        );

        const deleteAssetsPromises = assets.map(
          (a, i) =>
            new Promise((resolve) => {
              // Have a cheeky set of timeouts to pace it (#KISS)
              setTimeout(() => {
                remove(config, a.key).then(resolve).catch(error);
              }, i * apiSpeed);
            })
        );
        Promise.all(deleteAssetsPromises)
          .then(() => {
            success("All done!");
          })
          .catch(error);
      })
      .catch(error);
  }, 10000);
};
export default deleteEntireTheme;
