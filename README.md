# vue-oidc-client

This is a wrapper around [oidc-client-js](https://github.com/IdentityModel/oidc-client-js)
to better work in a vue application.

## Installs

### NPM

```bash
npm install vue-oidc-client
```

### Yarn

```bash
yarn add vue-oidc-client
```

### Browser

Copy the compiled UMD version in the `dist` folder to your project and reference it in a script tag.

**Note** As this uses `oidc-client` under the hood it may be necessary to include
[babel-polyfill](https://www.npmjs.com/package/babel-polyfill) when using an older browser (IE).

## Usage

See [the wiki](https://github.com/soukoku/vue-oidc-client/wiki) for quick docs.

## Getting the Source

```bash
git clone https://github.com/soukoku/vue-oidc-client.git
cd vue-oidc-client
```

### Running the sample

```bash
yarn serve
```

and then browse to the url indicated in the prompt.
