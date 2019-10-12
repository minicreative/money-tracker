const mongoose = require('mongoose')
const { username, password, host, name } = require('./../../config').database

module.exports = {
	setup: async () => {
		process.stdout.write(`Connecting to Mongo at ${host}...`)
		return mongoose.connect(`mongodb://${username}:${password}@${host}/${name}`, {
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
