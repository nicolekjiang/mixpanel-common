var path = require('path');

var webpackConfig = {
  entry: {
    'style-guide/compiled/index': './style-guide/index.js',
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
        loader: 'style!raw!autoprefixer!stylus',
      },
      {
        test: /\.json$/,
        exclude: /node_modules|build/,
        loader: 'json',
      },
    ],
  },
};

module.exports = webpackConfig;
