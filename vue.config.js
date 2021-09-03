const webpack = require('webpack');
module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        extraResources: ['`.\\node_modules\\ffmpeg-static-electron\\bin\\win\\x64\\ffmpeg.exe']
      }
    },
    chainWebpackRendererProcess: config => {
      config.plugin('define').tap(args => {
        args[0]['process.env.FLUENTFFMPEG_COV'] = false
        return args
      })
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.FLUENTFFMPEG_COV': false
      })
    ]
  }
}
