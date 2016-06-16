var path = require('path');

var webpackConfig = {
  entry: './lib/index.js',
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
        exclude: /node_modules/,
        loader: 'css-loader!autoprefixer-loader!stylus-loader',
      },
      {
        test: /\.jade$/,
        exclude: /node_modules/,
        loader: 'babel?presets[]=es2015!virtual-jade-loader',
      },
    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
};

module.exports = webpackConfig;
