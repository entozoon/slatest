# slaty

🛒 Store theme development toolkit

## Usage

Install

    npm i slaty --save-dev

Create a `slaty.config.json` file in your project root along the lines of:

```json
{
  "themeId": "11111111111",
  "appPassword": "66666666666666666666666666666666",
  "store": "my-store-name.mystore.com",
  "port": 3030
}
```

You will need to create a new theme in the Store admin, and get it's ID from the URL for your themeId value. Also, create a new private app with 'Theme templates and theme assets' permissions set to `Read and write` then use its password as your appPassword value.

Add yourself some `package.json` scripts such as:

```json
"start": "slaty",
"deploy": "slaty --upload-entire-theme"
```

And fire it up!

    npm start

## Deploying entire theme

When you first start a project, you possibly want to dump an entire theme into the project and have it upload. You can do so by running:

    npm run deploy

It's a little intense and takes a while, so I wouldn't recommend doing it on the regular.

Please note, this will not upload the `settings_data.json` - for safety reasons, as it contains all of your site's customisations. If you really are starting from scratch and want to upload it, find your theme's 'Edit code' button in the Store admin and paste the contents manually.

You may also wish to delete everything, which is possible - see CLI commands below.

### Ignoring

You might want to `.gitignore` your `assets/*.compiled.*` files in your project, as they're likely being compiled. Just a suggestion, to avoid merge conflicts with your fellow devfellows.

### Structuring

Your directory wants typical Store theme directories and an `/src/scss/app.scss` file gets compiled to `/assets/app.compiled.css` which is, in turn, uploaded. Similarly, with `/src/es6/app.es6`.

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

## Different compilation entry points?

If you want to compile different entry points than `app.scss` and `app.js`, add an `entryPaths` value to your `slaty.config.json` along the lines of:

```json
  "entryPaths": {
    "app.compiled": ["./src/scss/app.scss", "./src/es6/app.es6"],
    "extra-thing.compiled": ["./src/scss/extra-thing.scss"]
  }
```

## Stop watching directories or ignore certain files?

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
