const path = require('path')
module.exports = {
	entry: path.join(__dirname, 'app/index.js'),
	output: {
		filename: 'build.js',
		path: path.join(__dirname, 'public/src'),
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}, {
			test: /\.s?css$/i,
			use: [
				'style-loader',
				{
					loader:'css-loader',
					options: {
						url: false
					}
				},
				'sass-loader'
			],
		}]
	},
	node: {
		console: true,
		tls: 'empty',
		net: 'empty',
		fs: 'empty',
	}
}