const express = require('express')
const config = require('./config')
const server = express()
const api = require('./api')

// Setup UI routes
server.use(express.static('./build'))

// Setup API routers
server.use('/api', api.router)

// Start dependenies and listen to port
async function start () {
	await api.setup()
	server.listen(config.port, () => console.log(`money-tracker listening on port ${config.port}...`))
}

start()
