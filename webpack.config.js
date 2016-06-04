var path = require('path');

var webpackConfig = {
  entry: './index.js',
  output: {
    filename: 'examples/build/bundle.js',
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
        loader: 'css-loader!autoprefixer-loader!stylus-loader',
      },
    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
};

module.exports = webpackConfig;
