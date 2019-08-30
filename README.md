# Slatest

🛒 Shopify theme development toolkit

## Why?

Well, [Slate](https://github.com/Shopify/slate/) is Shopify's toolkit but [absurdly discontinued](https://github.com/Shopify/slate/issues/1020), and [Slater](https://github.com/the-couch/slater) is a proposed alternative - but not nearly as stable as is made out. For example, it [doesn't work on Windows](https://github.com/the-couch/slater/issues/11) and I've [made efforts](https://github.com/the-couch/slater/pull/63) to repair it but it might be a lost cause. Also the monorepo structure is an absolute nightmare to work with, in my opinion, such as how you could never npm install a fork to test it.

Aaaanyways.. TL;DR we need various simple features for a productive workflow:

- ✔ Template and asset sync with Shopify
- ✔ Live reloading (HMR style refresh through a local proxy)
- ✔ .SCSS -> .CSS compilation
- ✔ .ES6 -> JS compilation
- ✔ Wipe the entire theme's assets
- ✔ Upload an entire theme

## Usage

    npm i slatest

Create a `slatest.config.json` file in your project root along the lines of:

```json
{
  "themeId": "11111111111",
  "appPassword": "66666666666666666666666666666666",
  "store": "my-store-name.myshopify.com",
  "watch": ["**/*.liquid", "**/*.json", "assets/**/*"],
  "ignore": [
    "node_modules/**",
    "config/settings_data.json",
    "assets/**.scss",
    "assets/**.es6"
  ]
}
```

You will need to create a new theme in the Shopify admin, and get it's ID from the URL for your themeId value. Also, create a new private app with 'Theme templates and theme assets' permissions set to `Read and write` then use its password as your appPassword value.

Add yourself some `package.json` scripts such as:

```json
    "start": "slatest"
    "delete-entire-theme": "slatest --delete-entire-theme"
    "upload-entire-theme": "slatest --upload-entire-theme"
```

And fire it up!

    npm start

## Ignore

You might want to `.gitignore` your `assets/*.compiled.*` files in your project, as they're likely being compiled. Just a suggestion, to avoid merge conflicts with your fellow devfellows.

## Structure

Your directory wants typical Shopify theme directories such as layout, templates, sections, snippets, assets, ... etc. an `assets/app.scss` file gets compiled to `app.compiled.css` which is, in turn, uploaded. Similarly, `assets/app.es6` to `app.compiled.js`.

If you'd like to **see an example project**, hit me up with an issue and I'll make one.
