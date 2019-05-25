# vue-oidc-client

This is a wrapper around [oidc-client-js](https://github.com/IdentityModel/oidc-client-js)
to better work in a [Vue](https://vuejs.org/) application with
[Vue Router](https://router.vuejs.org/) integration.

## Installation

### NPM

```bash
npm install vue-oidc-client
```

### Yarn

```bash
yarn add vue-oidc-client
```

### Browser only

You will need to reference _both_ the base
[oidc-client-js](https://github.com/IdentityModel/oidc-client-js)
lib and this lib in the script tags in a page.

For this lib there's a compiled version (`dists/VueOidcAuth.umd.js` or
`dist/VueOidcAuth.umd.min.js`) in the repo if you can't use a cdn.

```html
<!-- sample cdns tied to a version -->
<script src="https://unpkg.com/oidc-client@1.7.1/lib/oidc-client.min.js"></script>
<script src="https://unpkg.com/vue-oidc-client@3.0/dist/VueOidcAuth.umd.min.js"></script>

<!-- OR sample cdns to latest version -->
<script src="https://unpkg.com/oidc-client"></script>
<script src="https://unpkg.com/vue-oidc-client"></script>
```

**Note** As this lib uses `oidc-client` it may be necessary to include
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
