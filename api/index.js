const BodyParser = require('body-parser')
const Morgan = require('morgan')
const Express = require('express')

const Database = require('./tools/Database')
const Messages = require('./tools/Messages')

module.exports = {
	setup: async (server) => {
		
		// Start database
		await Database.setup()

		// Configure Express server
		server.use(BodyParser.json())
		server.use(Morgan('tiny'))

		// Middleware: Set headers
		server.use((req, res, next) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
			res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-type,Authorization');
			res.setHeader('Access-Control-Allow-Credentials', true);
			next();
		});

		// Configure routes
		const router = Express.Router()
		router.get('/', function (req, res) {
			res.send('Welcome to the Money Tracker API')
		})
		require('./routes/User')(router)
		server.use('/api', router)

		// Middleware: Handle errors
		server.use((err, req, res, next) => {
			if (err) {
				if (err.handledError) {
					res.status(err.code);
					res.json({message: err.message})
				} else {
					res.status(Messages.codes.serverError);
					res.json({message: Messages.serverError});
				}
			} else next();
		});

		// Middleware: Success
		server.use((req, res) => {
			res.status(200);
			res.json(req.body);
		})
	}
}