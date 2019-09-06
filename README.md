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
- ❌ Template (this project only contains the tools for development, not a theme)

## Usage

Here is an [example project](https://github.com/entozoon/slatest-example), to show the installation and a typical directory structure.

    npm i slatest

Create a `slatest.config.json` file in your project root along the lines of:

```json
{
  "themeId": "11111111111",
  "appPassword": "66666666666666666666666666666666",
  "store": "my-store-name.myshopify.com",
  "watch": ["**/*.liquid", "**/*.json", "assets/**/*"],
  "ignore": ["node_modules/**", "config/settings_data.json"]
}
```

You will need to create a new theme in the Shopify admin, and get it's ID from the URL for your themeId value. Also, create a new private app with 'Theme templates and theme assets' permissions set to `Read and write` then use its password as your appPassword value.

Add yourself some `package.json` scripts such as:

```json
    "start": "slatest",
    "delete-entire-theme": "slatest --delete-entire-theme",
    "upload-entire-theme": "slatest --upload-entire-theme"
```

And fire it up!

    npm start

## Deploying Entire Theme

When you first start a project, you possibly want to dump an entire theme into the project and have it upload. You can do so by running:

    npm run upload-entire-theme

And delete it all, similarly. It's a little intense and takes a while, so I wouldn't recommend doing it on the regular.

## About what are you talking, Willis?

Have a look at the [example project](https://github.com/entozoon/slatest-example).

### Ignore

You might want to `.gitignore` your `assets/*.compiled.*` files in your project, as they're likely being compiled. Just a suggestion, to avoid merge conflicts with your fellow devfellows.

### Structure

Your directory wants typical Shopify theme directories and an `/src/scss/app.scss` file gets compiled to `/assets/app.compiled.css` which is, in turn, uploaded. Similarly, with `/src/es6/app.es6`.

    ┌──assets
    ├──config
    ├──layout
    ├──locales
    ├──sections
    ├──snippets
    ├──src
    │  ├──es6
    │  │    app.es6
    │  └──scss
    │       app.scss
    └──templates

### JS

You can write typical ES6, with imports and whatnot, or even .JSX files with Inferno or whatever and it'll be compiled into vanilla JS (IE11+). NB: You'll still need [polyfills](https://polyfill.io/) if you are indeed injecting Reacty stuff while supporting IE.

## Multiple Developers?

The inherent problem is that, when editing a file, it automatically uploads it to your site. So if multiple people are working on the same _theme_, it'll go haywire.

SO, the solution (thanks to a [friend](https://github.com/chrisfoster78)) is to:

- Duplicate your theme in the Shopify admin
- In `package.json`, add commands with a `config` parameter that'll make it use a custom version of the config file. i.e.

```json
    "start:jeff": "slatest --config slatest.config.jeff.json",
```

- Create this `slatest.config.jeff.json` file, changing the `themeId` value to target your duplicated theme
