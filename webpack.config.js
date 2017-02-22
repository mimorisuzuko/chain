const webpack = require('webpack');
const libpath = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {DefinePlugin, optimize: {UglifyJsPlugin}} = webpack;
const dst = 'docs';

module.exports = {
	entry: [
		libpath.join(__dirname, 'src/')
	],
	output: {
		path: libpath.join(__dirname, dst),
		filename: 'index.js'
	},
	module: {
		loaders: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loaders: [
					'babel-loader?presets[]=es2015,presets[]=react'
				]
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader',
					'sass-loader'
				]
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	plugins: [
		new CleanWebpackPlugin([dst], {
			root: __dirname,
			verbose: false,
			dry: false,
			exclude: ['index.html']
		}),
		new DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new UglifyJsPlugin({
			compress: {
				warnings: false
			},
			mangle: true
		})
	]
};