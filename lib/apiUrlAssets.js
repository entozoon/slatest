const { config } = require("./config");

module.exports = {
  apiUrlAssets: `https://${config.store}/admin/themes/${config.themeId}/assets.json`
};
