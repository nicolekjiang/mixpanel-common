/* global require */
var path = require('path');
var glob = require('glob');

var webpackConfig = {
  entry: {
    'suites': glob.sync(path.join(__dirname, '/!(build)/**.js')),
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '/build/'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
        },
      },
      {
        test: /\.(png|svg)$/,
        loader: 'url-loader?limit=50000',
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        loader: 'css-loader!autoprefixer-loader!stylus-loader',
      },
      {
        test: /\.jade$/,
        exclude: /node_modules/,
        loader: 'babel?presets[]=es2015&babelrc=false!virtual-jade-loader',
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json',
      },

    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  virtualJadeLoader: {
    vdom: 'snabbdom',
    runtime: 'var h = require("panel").h;',
  },
};

module.exports = webpackConfig;
