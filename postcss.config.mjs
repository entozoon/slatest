// import autoprefixer from "autoprefixer";
// export default {
//   plugins: [
//     // Instanciate the plugin up in here https://github.com/zeit/next-plugins/issues/140#issuecomment-382373663
//     autoprefixer({
//       grid: true,
//       overrideBrowserslist: ["last 2 versions"],
//     }),
//   ],
// };
module.exports = {
  plugins: [
    [
      "postcss-preset-env",
      {
        // Options
      },
    ],
  ],
};
