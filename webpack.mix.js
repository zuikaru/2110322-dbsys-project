const mix = require("laravel-mix");

mix
  .js("src/assets/app.js", "public")
  .sass("src/assets/style.scss", "public")
  .setPublicPath("public");
