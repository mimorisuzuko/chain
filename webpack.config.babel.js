import { DefinePlugin, optimize, HotModuleReplacementPlugin, LoaderOptionsPlugin } from 'webpack';
import libpath from 'path';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import { WATCH, isProduction, NODE_ENV } from './env';

const { UglifyJsPlugin, AggressiveMergingPlugin } = optimize;
const dst = 'docs';
const context = libpath.join(__dirname, 'src');

const plugins = [
	new CleanWebpackPlugin([dst], {
		root: __dirname,
		verbose: false,
		dry: false,
		exclude: ['index.html']
	}),
	new DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify(NODE_ENV)
		}
	}),
	new LoaderOptionsPlugin({
		options: {
			context
		}
	})
];

const generateScopedName = '[name]__[local]_[hash:base64:5]';
const babelPresets = ['react'];
const babelPlugins = [
	'transform-decorators-legacy',
	['react-css-modules',
		{
			context,
			generateScopedName,
			exclude: 'node_modules',
			filetypes: {
				'.scss': {
					syntax: 'postcss-scss'
				}
			}
		}]
];

if (isProduction) {
	babelPresets.push('es2015');
	plugins.push(
		new UglifyJsPlugin({ compress: { warnings: false }, mangle: true }),
		new AggressiveMergingPlugin()
	);
} else {
	babelPlugins.push('react-hot-loader/babel');
}

if (WATCH) {
	plugins.push(new HotModuleReplacementPlugin());
}

const config = {
	entry: context,
	output: {
		path: libpath.join(__dirname, dst),
		filename: 'index.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: babelPresets,
						plugins: babelPlugins
					}
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
	plugins
};

if (WATCH) {
	Object.assign(config, {
		entry: [
			'webpack-dev-server/client?http://0.0.0.0:3000',
			'webpack/hot/only-dev-server',
			'react-hot-loader/patch',
			libpath.join(__dirname, 'src/')
		],
		devServer: {
			hot: true,
			contentBase: dst,
			port: 3000,
			host: '0.0.0.0',
			inline: true
		}
	});
}

export default config;
