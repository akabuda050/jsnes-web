# JSNES Web UI

A React-based web UI for [JSNES](https://github.com/akabuda050/jsnes).
Works with [SERVER](https://github.com/akabuda050/jsnes-backend)

## Running in development

    $ yarn install
    $ yarn start

## Building for production

    $ yarn build

The built app will be in `build/`.

## Running tests

    $ yarn test

## Formatting code

All code must conform to [Prettier](https://prettier.io/) formatting. The test suite won't pass unless it does.

To automatically format all your code, run:

    $ yarn run format

## Embedding JSNES in your own app

Unfortunately isn't supported for now.

A project for potential contributors (hello!): jsnes-web should be reusable and on NPM! It just needs compiling and bundling.

## Setup server

Open `src/config.js` and change `config.SERVER_URL`. For example:

```javascript
const config = {
  SERVER_URL: "ws://localhost:9000",
};
```
