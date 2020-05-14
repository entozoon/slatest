# Slatest

🛒 Shopify theme development toolkit

## Why?

Well, [Slate](https://github.com/Shopify/slate/) is Shopify's toolkit but [absurdly discontinued](https://github.com/Shopify/slate/issues/1020), and [Slater](https://github.com/the-couch/slater) is a proposed alternative - but not nearly as stable as is made out. For example, it [doesn't work on Windows](https://github.com/the-couch/slater/issues/11) and I've [made efforts](https://github.com/the-couch/slater/pull/63) to repair it but it might be a lost cause. Also the monorepo structure is an absolute nightmare to work with, in my opinion, such as how you could never npm install a fork to test it.

Aaaanyways.. TL;DR we need various simple features for a productive workflow:

- ✔ Template and asset sync with Shopify
- ✔ Live reloading (HMR style refresh through a local proxy) [disabled by default]
- ✔ .SCSS -> .CSS compilation
- ✔ .ES6 -> JS compilation
- ✔ Wipe the entire theme's assets
- ✔ Upload an entire theme
- ❌ Template (this project only contains the tools for development, not a theme)

## Usage

Here is an [**example project**](https://github.com/entozoon/slatest-example), showing the installation and a typical directory structure, if that helps but what you do is:

    npm i slatest

Create a `slatest.config.json` file in your project root along the lines of:

```json
{
  "themeId": "11111111111",
  "appPassword": "66666666666666666666666666666666",
  "store": "my-store-name.myshopify.com",
  "port": 3030
}
```

You will need to create a new theme in the Shopify admin, and get it's ID from the URL for your themeId value. Also, create a new private app with 'Theme templates and theme assets' permissions set to `Read and write` then use its password as your appPassword value.

Add yourself some `package.json` scripts such as:

```json
"start": "slatest",
"upload-entire-theme": "slatest --upload-entire-theme"
```

And fire it up!

    npm start

## Deploying entire theme

When you first start a project, you possibly want to dump an entire theme into the project and have it upload. You can do so by running:

    npm run upload-entire-theme

It's a little intense and takes a while, so I wouldn't recommend doing it on the regular.

Please note, this will not upload the `settings_data.json` - for safety reasons, as it contains all of your site's customisations. If you really are starting from scratch and want to upload it, find your theme's 'Edit code' button in the Shopify admin and paste the contents manually.

You may also wish to delete everything, which is possible - see CLI commands below.

## About what are you talking, Willis?

Have a look at the demo:

### [Example project](https://github.com/entozoon/slatest-example).

### Ignoring

You might want to `.gitignore` your `assets/*.compiled.*` files in your project, as they're likely being compiled. Just a suggestion, to avoid merge conflicts with your fellow devfellows.

### Structuring

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

### JavaScripting

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

### If you're a Shopify Partner

Creating a [whole new dev store](https://help.shopify.com/en/partners/dashboard/development-stores) is an even safer alternative, if possible, with a separate (entirely different) config file.

## Different compilation entry points?

If you want to compile different entry points than `app.scss` and `app.js`, add an `entryPaths` value to your `slatest.config.json` along the lines of:

```json
  "entryPaths": {
    "app.compiled": ["./src/scss/app.scss", "./src/es6/app.es6"],
    "extra-thing.compiled": ["./src/scss/extra-thing.scss"]
  }
```

## Stop watching directories or ignore certain files?

By default it watches all files in the typical [theme structure](https://shopify.dev/tutorials/develop-theme-templates) and ignores `config/settings_data.json` but, for whatever reason, you could change all that by modifying your `slatest.config.json` with something like:

```json
{
  "watch": ["assets/*.css", "snippets/**/*"],
  "ignore": ["config/settings_data.json", "snippets/never-change-this.liquid]
}
```

## Just show me what you got!

Here are all the CLI options.

| Parameter               | Shorthand | What it do                                                                                                                                |
| ----------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `--config "filename"`   | `-c`      | Use a specified JSON config file.                                                                                                         |
| `--livereload`          | `-l`      | Enable live reload [**disabled by default** - as not everyone likes it, and it's buggy with certain plugins that domain check your site]. |
| `--build`               | `-b`      | Perform a one-off build, as opposed to it's default watch behaviour with nice minified output and whathaveyou.                            |
| `--upload-entire-theme` | `-u`      | **[DANGER]** Upload all the theme files to your site, overwriting everything!                                                             |
| `--delete-entire-theme` | `-d`      | **[DANGER]** Delete all the theme files. Rarely useful, except when starting a site truly from scratch.                                   |
| `--sound-effects`       | `-s`      | Enable sound effects, e.g. on successful upload                                                                                           |
