const express = require('express')
const config = require('./config')
const server = express()
const api = require('./api')

// Start dependenies and listen to port
async function start () {

	// Setup UI routes
	server.use(express.static('./public'))

	// Setup API
	await api.setup(server)

	// Listen on port
	server.listen(config.port, () => console.log(`money-tracker listening on port ${config.port}...`))
}

start()
