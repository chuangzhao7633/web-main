const os = require('os');
const path = require('path');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const threads = os.cpus().length; // cpu 核心数

// 解析路径为绝对路径
const resolve = dir => path.resolve(__dirname, '..', dir);

const getStyleLoaders = isProd => [
  isProd ? MiniCssExtractPlugin.loader : 'style-loader',
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

module.exports = isProd => ({
  entry: './src/index.jsx',
  output: {
    path: resolve('dist'),
    filename:'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'static/images/[name].[hash:8][ext][query]',
    publicPath: '/'
  },
  module: {
    rules: [
      // 处理 css
      {
        test: /\.css$/,
        use: getStyleLoaders(isProd)
      },
      // 处理 less
      {
        test: /\.less$/,
        use:[
          ...getStyleLoaders(isProd), 
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: {
                  '@ant-prefix': 'main-ant',
                  '@font-size-base': '12px'
                },
                javascriptEnabled: true
              }
            }
          }
        ]
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
        include: resolve('src'),
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
              plugins: [!isProd && 'react-refresh/babel'].filter(Boolean) // 激活 js 的 HMR 功能
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new EslintWebpackPlugin({
      context: resolve('src'),
      exclude: "node_modules",
      cache: true,
      cacheLocation: resolve('node_modules/.cache/.eslintcache'),
      threads // 多进程打包
    }),
    new HtmlWebpackPlugin({
      template: resolve('template/index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        // 打包时将 static 下的文件复制到 dist 文件下 static
        { 
          from: resolve('static'),
          to: resolve('dist/static')
        }
      ]
    })
  ],
  optimization: {
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`
    }
  },
  // webpack 解析模块加载选项
  resolve: {
    // 自动补全文件扩展名
    extensions: ['.jsx', '.js', '.json'],
    alias: {
      '@util': resolve('src/util'),
      '@service': resolve('src/service'),
      '@component': resolve('src/components')
    }
  },
  // 关闭性能分析 提升打包速度
  performance: false
});