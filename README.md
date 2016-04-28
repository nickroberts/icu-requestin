# ICU Requestin'

Spy on HTTP requests / responses

## Requirements
* node 5+ (not 6, yet)
* gulp (globally installed)
* Chrome (duh!)

## Setup
* `npm install`

## Building
* `gulp watch` -- watches for changes, then will transpile using babel (and sass)
* `gulp build` -- builds production-ready code in the `dist` folder
* `gulp package` -- zips up the `build` folder, and puts it in the `package` folder

When editing `js` files, edit the ones in the `scripts.babel` folder.

When editing `sass` files, edit the ones in the `styles.scss` folder.

Enjoy!