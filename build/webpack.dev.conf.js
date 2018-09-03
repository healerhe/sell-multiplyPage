'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const express = require('express')
const app = express()
var appData = require('../data.json')//加载本地数据文件
var seller = appData.seller
var goods = appData.goods
var ratings = appData.ratings
var orders = appData.orders;
var apiRoutes = express.Router()
app.use('/api', apiRoutes)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/pay.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },
    // 添加mock数据
    before(app) {
      app.get('/api/appData', (req, res) => {
        res.json({
          errno: 0,
          data: appData
        })//接口返回json数据，上面配置的数据appData就赋值给data请求后调用
      }),
        app.get('/api/seller', (req, res) => {
          res.json({
            // 这里是你的json内容
            errno: 0,
            data: seller
          })
        }),
        app.get('/api/goods', (req, res) => {
          res.json({
            // 这里是你的json内容
            errno: 0,
            data: goods
          })
        }),
        app.get('/api/ratings', (req, res) => {
          res.json({
            // 这里是你的json内容
            errno: 0,
            data: ratings
          })
        }),
        app.get('/api/orders', (req, res) => {
          res.json({
            // 这里是你的json内容
            errno: 0,
            data: orders
          })
        })
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    /* 注释这个区域的文件 ------------- 开始(原有) */
   /* new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      chunks: ['app']
    }), */
    /* 注释这个区域的文件 ------------- 结束(原有) */
    /* 注释这个区域的文件 ------------- 开始(新增) */
    /*new HtmlWebpackPlugin({
      filename: 'src/modules/pay/pay.html',
      template: 'src/modules/pay/pay.html',
      inject: true,
      chunks: ['pay']
    }),
    new HtmlWebpackPlugin({
      filename: 'src/modules/order/order.html',
      template: 'src/modules/order/order.html',
      inject: true,
      chunks: ['order']
    }),
    new FriendlyErrorsPlugin(),*/
     /* 注释这个区域的文件 ------------- 结束(新增) */
    // copy custom static assets
    new FriendlyErrorsPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ].concat(utils.htmlPlugin())
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
