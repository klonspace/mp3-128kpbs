module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
}