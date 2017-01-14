var path = require('path');

var webpackConfig = {
  entry: {
    'style-guide/compiled/index': './style-guide/index.js',
    'style-guide-new/compiled/index': './style-guide-new/index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname,
    publicPath: '/examples',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|build/,
        loader: 'babel',
        query: {
          babelrc: false,
          presets: ['es2015'],
        },
      },
      {
        test: /\.jade$/,
        exclude: /node_modules|build/,
        loader: 'babel?presets[]=es2015!virtual-jade',
      },
      {
        test: /\.styl$/,
        exclude: /node_modules|build/,
        loader: 'style!css!autoprefixer!stylus',
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json',
      },
      {
        test: /\.(png|svg)$/,
        loader: 'url-loader',
      },
    ],
  },
  virtualJadeLoader: {
    vdom: 'snabbdom',
    runtime: 'var h = require("panel").h;',
  },
};

module.exports = webpackConfig;
