const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const base = require('./webpack.base.config');

module.exports = () => merge(base(false), {
  plugins: [
    new ReactRefreshWebpackPlugin() // 激活 js 的 HMR 功能
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    host: 'localhost',
    port: 5001,
    open: true,
    hot: true,
    client: {
      overlay: true,
    },
    historyApiFallback: true, // 解决前端路由刷新 404 问题
    headers: {
			'Access-Control-Allow-Origin': '*'
		}
  }
})