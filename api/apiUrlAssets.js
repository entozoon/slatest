const { config } = require("../lib/config");

module.exports = {
  apiUrlAssets: `https://${config.store}/admin/themes/${config.themeId}/assets.json`
};
