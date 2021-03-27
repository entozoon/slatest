#! /usr/bin/env node
var shell = require("shelljs");
var cd = "node_modules/slaty/bin/";

// Pass args through to compile script
let args = "";
if (process.argv) {
  args = process.argv.splice(2).join(" ");
}
shell.exec("node " + cd + "slaty.js " + args);
