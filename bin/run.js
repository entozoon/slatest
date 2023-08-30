#! /usr/bin/env node
import shell from "shelljs";
var cd = "node_modules/slatest/bin/";
// import path from "path";
// const cd = path.resolve(__dirname, "../bin/");

// Pass args through to compile script
let args = "";
if (process.argv) {
  args = process.argv.splice(2).join(" ");
}
shell.exec("node " + cd + "slatest.js " + args);
