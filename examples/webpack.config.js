var path = require('path');

var webpackConfig = {
  entry: {
    'mixpanel-common': '../lib/index.js',
    'panel-example': './panel/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '/build/')
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
