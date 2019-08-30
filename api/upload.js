const fetch = require("node-fetch");
const fs = require("fs");
const { config } = require("../lib/config");
const apiUrlAssets = require("./apiUrlAssets");
const { success, assetKey } = require("../lib/utils");

const uploadFileContents = (filepath, attachment, resolve, reject) => {
  const key = assetKey(filepath);
  return fetch(apiUrlAssets, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": config.appPassword,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      asset: {
        key,
        attachment
      }
    })
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
module.exports = filepath =>
  new Promise((resolve, reject) => {
    // Read the file, getting its contents as a base64 encoded string
    fs.readFile(filepath, "utf8", (err, contents) => {
      if (err) reject(`[ERROR] ${filepath} : ${err}`);
      const attachment = Buffer.from(contents, "utf-8").toString("base64");
      // Upload the file if has contents
      if (attachment.length) {
        uploadFileContents(filepath, attachment, resolve, reject);
      }
      // If the file is empty (which happens when read fails, intermittently), or a legit empty file,
      // chill for a moment then have another go. Probably a neater way but at least it's non-blocking
      else {
        setTimeout(() => {
          fs.readFile(filepath, "utf8", (err, contents) => {
            const attachment = Buffer.from(contents, "utf-8").toString(
              "base64"
            );
            uploadFileContents(filepath, attachment, resolve, reject);
          });
        }, 500);
      }
    });
  });
