const path = require('path')
const hwp = require('html-webpack-plugin')
module.exports = {
	entry: path.join(__dirname, 'app/index.js'),
	output: {
		filename: 'build.js',
		path: path.join(__dirname, 'build'),
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	},
	plugins: [
		new hwp({template: path.join(__dirname, 'app/index.html')})
	]
}