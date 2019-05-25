module.exports = {
  transpileDependencies: ['vue-oidc-client'],
  chainWebpack: config => {
    config.resolve.set('symlinks', false)
  }
}
