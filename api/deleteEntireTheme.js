import { success, error } from "../lib/utils.js";
import getAssets from "./getAssets.js";

const deleteEntireTheme = (config) => {
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
            (assets.length * 500) / 500 / 60
          )} minutes..`
        );

        const deleteAssetsPromises = assets.map(
          (a, i) =>
            new Promise((resolve) => {
              // Have a cheeky set of timeouts to pace it (#KISS)
              setTimeout(() => {
                remove(config, a.key).then(resolve).catch(error);
                // Shopify API call rates keep bloody changing, apparently now 4/s max
              }, i * 500);
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
