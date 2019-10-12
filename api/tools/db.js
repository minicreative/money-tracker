const mongoose = require('mongoose')
const { username, password, url, name } = require('./../../config').database

module.exports = {
	setup: async () => {
		process.stdout.write(`Connecting to Mongo at ${url}...`)
		return mongoose.connect(`mongodb://${username}:${password}@${url}/${name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).then(() => {
			process.stdout.write(' done!\n')
		}).catch(err => {
			process.stderr.write('Database error: '+err.stack+'\n')
			process.exit(0)
		})
	}
}
