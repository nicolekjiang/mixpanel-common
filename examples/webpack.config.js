var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

var webpackConfig = {
  entry: {
    'panel-example/compiled/index': './panel-example/index.js',
    'style-guide/compiled/index': './style-guide/index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          babelrc: false,
        },
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json',
      },
      {
        test: /\.styl$/,
        include: /examples/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader!stylus-loader'),
      },
      {
        test: /\.styl$/,
        exclude: /examples/,
        loader: 'css-loader!autoprefixer-loader!stylus-loader',
      },
      {
        test: /\.jade$/,
        exclude: /node_modules/,
        loader: 'babel?presets[]=es2015&babelrc=false!virtual-jade-loader',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
  ],
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
};

module.exports = webpackConfig;
