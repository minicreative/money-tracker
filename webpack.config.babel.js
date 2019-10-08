import path from 'path'
import hwp from 'html-webpack-plugin'
module.exports = {
	entry: path.join(__dirname, 'app/app.js'),
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