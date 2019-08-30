const { config } = require("../lib/config");

module.exports = `https://${config.store}/admin/api/2019-10/themes/${config.themeId}/assets.json`;
