doiuse.com
==========

This is the repo for the [doiuse.herokuapp.com](http://doiuse.herokuapp.com) website.

See also:
* [doiuse](https://github.com/anandthakker/doiuse) - The underlying linter, available as a CLI, node module, and [postcss](https://github.com/postcss/postcss) plugin.


## Local Development Tasks

Lifecycle scripts included in doiuse.com

### `test`

echo "Error: no test specified" && exit 1

### `start`

node index.js - Runs a local development environment

### `postinstall`

npm run build-frontend

### Available via `npm run-script`
  * **assets**
    * `mkdir -p public && cp -R assets/* public/`
  * **sass**
    * `node-sass --include-path sass sass/main.scss public/main.css`
  * **bundle**
    * `browserify . -o public/bundle.js`
  * **build-frontend**
    * `npm run assets && npm run bundle && npm run sass`
