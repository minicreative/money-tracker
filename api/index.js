const api = require('express').Router()

api.get('/', function (req, res) {
	res.send('money-tracker API')
})

module.exports = api