/* eslint-disable */
var path = require('path');
var ExtractText = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './src/index',
  },

  output: {
    path: path.resolve('build'),
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|build)/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        loader: ExtractText.extract({ fallback: 'style-loader', use: 'css-loader!sass-loader' })
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2($|\?))$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      },
      {
        test: /\.(otf|ttf|eot?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      },
    ],
  },

  plugins: [
    new ExtractText('[name].css')
  ]
};
