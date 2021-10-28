const webpack = require('webpack')
module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ['ffmpeg-static-electron'], // 'ffprobe-static' works for ffprobe-static too
      nodeModulesPath: ['../../node_modules', './node_modules'],
      mainProcessWatch: ['src/soundcloud.js', 'src/menu.js'],
      builderOptions: {
        productName: 'MP3 128 KBPS',
        win: {
          icon: './src/assets/icon.ico'
        },
        mac : {
          icon: './src/assets/icon.icns'
        }
      }
    },
    chainWebpackRendererProcess: config => {
      config.plugin('define').tap(args => {
        args[0]['process.env.FLUENTFFMPEG_COV'] = false
        return args
      })
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.FLUENTFFMPEG_COV': false
      })
    ]
  }
}
