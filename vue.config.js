module.exports = {
  transpileDependencies: ['@dcloudio/uni-ui'],

  devServer: {
    proxy: {
      '/api': {
        target: 'https://ohxcx.ohiisp.com',
        changeOrigin: true,
      },
    },
    port: 8090,
  },
};
