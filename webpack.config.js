const { DefinePlugin, HotModuleReplacementPlugin, LoaderOptionsPlugin } = require('webpack');
const libpath = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, { mode }) => {
	const dst = 'docs';
	const generateScopedName = '[name]__[local]_[hash:base64:5]';
	const context = libpath.join(__dirname, 'src/');
	const presets = ['react'];
	const isProduction = mode === 'production';
	const babelPlugins = [
		'transform-decorators-legacy',
		['react-css-modules',
			{
				context,
				generateScopedName,
				filetypes: {
					'.scss': {
						syntax: 'postcss-scss'
					}
				}
			}
		]
	];

	const plugins = [
		new CleanWebpackPlugin([dst], {
			root: __dirname,
			verbose: false,
			dry: false,
			exclude: ['index.html']
		}),
		new DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(mode)
			}
		}),
		new LoaderOptionsPlugin({
			options: {
				context
			}
		})
	];

	if (isProduction) {
		presets.push(
			[
				'env', {
					targets: {
						chrome: 59
					}
				}
			],
			'stage-3'
		);
	} else {
		babelPlugins.push('react-hot-loader/babel');
		plugins.push(new HotModuleReplacementPlugin());
	}

	return {
		context,
		entry: isProduction ?
			[
				'babel-polyfill',
				context
			] : [
				'webpack-dev-server/client?http://0.0.0.0:3000',
				'webpack/hot/only-dev-server',
				'react-hot-loader/patch',
				context
			],
		output: {
			path: libpath.join(__dirname, dst),
			publicPath: 'http://localhost:3000/',
			filename: '[name].js'
		},
		module: {
			rules: [
				{
					test: /\.js(x?)$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					options: {
						babelrc: false,
						presets,
						plugins: babelPlugins
					}
				},
				{
					test: /\.scss$/,
					use: [
						'style-loader',
						`css-loader?importLoader=1&modules&localIdentName=${generateScopedName}`,
						'postcss-loader',
						'sass-loader'
					]
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				}
			]
		},
		resolve: {
			extensions: ['.js', '.jsx']
		},
		plugins,
		devServer: {
			hot: true,
			port: 3000,
			host: '0.0.0.0',
			contentBase: libpath.join(__dirname, dst)
		},
		optimization: {
			splitChunks: {
				name: 'vendor',
				chunks: 'initial',
			}
		}
	};
};
