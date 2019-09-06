const fetch = require("node-fetch");
const fs = require("fs");
const { success, assetKey } = require("../lib/utils");

const uploadFileContents = (config, filepath, contents, resolve, reject) => {
  let asset = {
    key: assetKey(filepath)
  };
  // There's no information really about whether it should use attachment,
  // with base64 encoded data, or just value with a string as suggested for .liquid
  // Attachment works for both though, and we have contents readily base64 encoded so let's use it
  // https://help.shopify.com/en/api/reference/online-store/asset
  // const filetype = filepath.split(".").pop();
  // if (filetype === "liquid") {
  //   asset.value = contents;
  // } else {
  //   asset.attachment = new Buffer(contents).toString("base64");
  // }
  // Just always using the base64 contents straight from readFile(..., 'base64') :
  asset.attachment = contents;

  const apiUrlAssets = require("./apiUrlAssets")(config);
  return fetch(apiUrlAssets, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": config.appPassword,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ asset })
  })
    .then(r => {
      // console.log("r.status", r.status);
      // console.log("r.headers", r.headers.get("content-type"));
      // Reject if it borks straight away
      if (!r.status) {
        // 200 good, 422 bad, but provides json errors..
        let errorText = r.statusText;
        if (r.status == 404) {
          // This should be a proper dir check really..
          errorText =
            "Couldn't find appropriate place within Shopify. Is your directory definitely one of these:\nlayout, templates, sections, snippets, assets, config, locales ?";
        }
        return reject(`[ERROR] ${filepath} : ${errorText}`);
      }
      return r.json();
    })
    .then(r => {
      // Reject if there's a more shopify-y error, such as missing liquid tags or schema problems
      if (r.errors) {
        return reject(`\n[ERROR] ${filepath} :\n${JSON.stringify(r.errors)}`);
      }
      success("[uploaded]", filepath);
      return resolve(r);
    })
    .catch(reject);
};

module.exports = config => filepath =>
  new Promise((resolve, reject) => {
    // Read the file, and upload the contents
    fs.readFile(filepath, "base64", (err, contents) => {
      if (err) reject(`[ERROR] ${filepath} : ${err}`);
      // Upload the file if has contents
      if (contents.length) {
        uploadFileContents(config, filepath, contents, resolve, reject);
      }
      // If the file is empty (which happens when read fails, intermittently), or a legit empty file,
      // chill for a moment then have another go. Probably a neater way but at least it's non-blocking
      else {
        setTimeout(() => {
          fs.readFile(filepath, "base64", (err, contents) => {
            uploadFileContents(config, filepath, contents, resolve, reject);
          });
        }, 500);
      }
    });
  });
