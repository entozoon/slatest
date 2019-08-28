const { config } = require("../lib/config");

module.exports = `https://${config.store}/admin/themes/${config.themeId}/assets.json`;
