const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const dotenv = require('dotenv');

// Set up environment variables.
const result = dotenv.config();

// Prevent other keys from leaking into the app by defining allowed keys.
const allowedKeys = [
  'INTERCOM_APP_ID',
  'SENTRY_PUBLIC_DSN',
  'SEGMENT_WRITE_KEY',
  'DEBUG',
  'BASE_URL',
  'SOCKET_BASE'
];

const env = result.error ? process.env : result.parsed;
const envKeys = Object.keys(env).reduce((acc, next) => {
  if (allowedKeys.includes(next)) {
    acc[`process.env.${next}`] = JSON.stringify(env[next]);
  }
  return acc;
}, {});

module.exports = {
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              publicPath: 'images'
            }
          }
        ]
      },
      {
        test: /favicon\.ico$/,
        loader: 'url',
        query: {
          limit: 1,
          name: '[name].[ext]'
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.(ttf|otf|eot|svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
              publicPath: 'fonts'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
    alias: {
      src: path.resolve(__dirname, 'src/'),
      style: path.resolve(__dirname, 'src/sass/'),
      pages: path.resolve(__dirname, 'src/components/pages/'),
      components: path.resolve(__dirname, 'src/components/'),
      models: path.resolve(__dirname, 'src/models/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      lib: path.resolve(__dirname, 'src/lib'),
      images: path.resolve(__dirname, 'src/images')
    }
  },
  devServer: {
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.html',
      filename: './index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new webpack.DefinePlugin(envKeys),
    // TODO: Can be removed once Froala releases jQuery-less version.
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
