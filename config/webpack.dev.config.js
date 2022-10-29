const os = require('os');
const path = require('path');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const threads = os.cpus().length; // cpu 核心数

const getStyleLoaders = () => [
  'style-loader',
  'css-loader',
  {
    /* 
      处理 css 兼容性问题
      配合 package.json 中的 browserslist 指定兼容性
    */
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: ['postcss-preset-env']
      }
    }
  }
];

module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined,
    filename:'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/images/[name].[hash:8][ext][query]'
  },
  module: {
    rules: [
      // 处理 css
      {
        test: /\.css$/,
        use: getStyleLoaders()
      },
      // 处理 less
      {
        test: /\.less$/,
        use:[...getStyleLoaders(), 'less-loader']
      },
      // 处理图片
      {
        test: /\.(jpe?g|png|gif|webp|svg)/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      },
      // 处理其他资源
      {
        test: /\.(woff2?|ttf)/,
        type: 'asset/resource'
      },
      // 处理 js
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, '../src'),
        use: [
          {
            loader: 'thread-loader', // 开启多进程对 babel 进行处理
            options: {
              works: threads // 进程数量
            }
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              plugins: ['react-refresh/babel'] // 激活 js 的 HMR 功能
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new EslintWebpackPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: "node_modules",
      cache: true,
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache'),
      threads // 多进程打包
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html')
    }),
    new ReactRefreshWebpackPlugin() // 激活 js 的 HMR 功能
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`
    }
  },
  // webpack 解析模块加载选项
  resolve: {
    // 自动补全文件扩展名
    extensions: ['.jsx', '.js', '.json']
  },
  devServer: {
    host: 'localhost',
    port: 3001,
    open: true,
    hot: true,
    historyApiFallback: true // 解决前端路由刷新 404 问题
  }
}