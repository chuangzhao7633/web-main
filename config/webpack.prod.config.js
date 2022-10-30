const os = require('os');
const path = require('path');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const base = require('./webpack.base.config');

const threads = os.cpus().length; // cpu 核心数

module.exports = () => merge(base(true), {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        // 打包时将 public 下的文件复制到 dist 文件下
        { 
          from: path.resolve(__dirname, '../static'),
          to: path.resolve(__dirname, '../dist/static')
        }
      ]
    })
  ],
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      // node_modules 中的文件太大 需要分别打包
      cacheGroups: {
        // react react-dom react-router-dom 一起打包成一个 js 文件
        react: {
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          name: 'react-chunk',
          priority: 40
        },
        // 剩下 node_modules 单独打包
        libs: {
          test: /[\\/]node_modules[\\/]/,
          name: 'libs-chunk',
          priority: 30
        }
      }
    },
    minimizer:[
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin({
        parallel: threads // 开启多进程和进程数量处理 Terser
      })
    ]
  }
});