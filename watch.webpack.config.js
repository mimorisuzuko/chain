const webpack = require('webpack');
const libpath = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {DefinePlugin, optimize: {UglifyJsPlugin}, HotModuleReplacementPlugin} = webpack;
const dst = 'docs';

module.exports = {
	entry: [
		'webpack-dev-server/client?http://localhost:3000',
		'webpack/hot/only-dev-server',
		libpath.join(__dirname, 'src/')
	],
	output: {
		path: libpath.join(__dirname, dst),
		filename: 'index.js'
	},
	devServer: {
		hot: true,
		contentBase: 'docs',
		port: 3000,
		inline: true
	},
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				loaders: [
					'react-hot-loader',
					'babel-loader?presets[]=es2015,presets[]=react'
				]
			},
			{
				test: /\.scss$/,
				use: [
					'react-hot-loader',
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
		new HotModuleReplacementPlugin(),
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