const os = require('os');
const path = require('path');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const threads = os.cpus().length; // cpu 核心数

const getStyleLoaders = () => [
  // 提取 css 成单独文件
  MiniCssExtractPlugin.loader,
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
    path: path.resolve(__dirname, '../dist'),
    filename:'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'static/images/[name].[hash:8][ext][query]',
    clean: true
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
              cacheCompression: false
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
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        // 打包时将 public 下的文件复制到 dist 文件下
        { 
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          globOptions: {
            // 忽略 index.html 文件
            ignore: ["**/index.html"]
          }
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
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`
    },
    minimizer:[
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  },
  // webpack 解析模块加载选项
  resolve: {
    // 自动补全文件扩展名
    extensions: ['.jsx', '.js', '.json']
  }
}