var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'whatwg-fetch',
    'babel-polyfill',
    'webpack-hot-middleware/client',
    './src/comments'
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/assets/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      },
      '__DEVTOOLS__': process.env.DEVTOOLS === 'true' ? true : false
    })
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader!cssnext-loader' },
      { test: /\.js$/, loader: 'babel', include: path.join(__dirname, 'lib') },
      { test: /\.(png|jpg|gif)$/, loader:'url?limit=8192' }
    ]
  },
  cssnext: {
    browsers: 'last 2 versions'
  }
};
