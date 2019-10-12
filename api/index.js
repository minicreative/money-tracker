const router = require('express').Router()
const db = require('./tools/db')

router.get('/', function (req, res) {
	res.send('money-tracker API')
})

module.exports = {
	router,
	setup: async () => {
		await db.setup()
	}
}