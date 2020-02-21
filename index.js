const Express = require('express')
const Morgan = require('morgan')

const config = require('./config')
const api = require('./api')

// Start dependenies and listen to port
async function start () {

	process.enz.TZ = 'America/New_York'

	// Setup server
	const server = Express()
	server.use(Morgan('tiny'))

	// Setup API
	await api.setup(server)

	// Setup UI routes
	server.use(Express.static('public'))
	server.get('*', function (req, res) {
	    res.sendFile('./public/index.html', {"root": "."})
	})

	// Listen on port
	server.listen(config.port, () => console.log(`money-tracker listening on port ${config.port}...`))
}

start()
