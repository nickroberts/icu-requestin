# ICU Requestin'

Spy on HTTP requests / responses

## Requirements
* node 6
* gulp (globally installed)
* Chrome (duh!)

## Setup
* `npm install`

## Building
* `gulp watch` -- watches for changes, then will transpile using babel (and sass)
* `gulp build` -- builds production-ready code in the `dist` folder
* `gulp package` -- zips up the `build` folder, and puts it in the `package` folder

## Installing into Chrome
Since it is not in the Chrome store, right now, you need to manually install it into Chrome.
* Build the extension using `gulp build`.
* In Chrome, in the url bar, go to `chrome://extensions`.
* Click on `Lod unpacked extension`.
* Navigate to the `dist` folder where you saved the code and select it.

This should load the extension into Chrome, and you can use it.

You should update the settings to only spy on the urls you would like to spy on.

You can also disable the spying in the settings, and only use the search functionality.

## Notes
* When editing `js` files, edit the ones in the `scripts.babel` folder.
* When editing `sass` files, edit the ones in the `styles.scss` folder.

Enjoy!
