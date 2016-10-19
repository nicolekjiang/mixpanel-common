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
        },
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json',
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
    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
};

module.exports = webpackConfig;