const express = require('express')
const port = 3000

// Create new Express server
const server = express()

// Setup UI routes
server.use(express.static('./build'))

// Setup API routes
server.use('/api', require('./api'))

// Run server on port
server.listen(port, () => console.log(`money-tracker listening on port ${port}...`))