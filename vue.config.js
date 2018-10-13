module.exports = {
  productionSourceMap: false,
  css: { extract: false },
  devServer: {
    https: true
  }
  //   configureWebpack: {
  //       output: {
  //           libraryExport: 'default'
  //       },
  //   }
  // chainWebpack: config => {
  // config.externals({
  //   ...config.get('externals'),
  //   'oidc-client': 'oidc'
  // });
  // config.module
  //     .rule('vue')
  //     .use('vue-loader')
  //     .loader('vue-loader')
  //     .tap(options => {
  //         // modify the options...
  //         return options
  //     })
  // }
};
