/** @namespace routes/Insights */

const Async = require('async')
const Papa = require('papaparse')
const Moment = require('moment')

const Database = require('./../tools/Database')
const Validation = require('./../tools/Validation')
const Secretary = require('./../tools/Secretary')
const Messages = require('./../tools/Messages')
const Authentication = require('./../tools/Authentication')

const Transaction = require('./../model/Transaction')
const Category = require('./../model/Category')

function clone(object) {
	return JSON.parse(JSON.stringify(object))
}

module.exports = router => {

	/**
	 * @api {POST} /insights.category Category
	 * @apiName Category
	 * @apiGroup Insights
	 * @apiDescription Get sums by category
	 *
	 * @apiSuccess {Object} categories
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/insights.category', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Find transactions for user
			(token, callback) => {
				Database.find({
					model: Transaction,
					sort: '-date',
					query: {
						user: token.user,
					},
				}, (err, transactions) => {
					callback(err, token, transactions)
				})
			},

			// Find categories for user
			(token, transactions, callback) => {
				Database.find({
					model: Category,
					query: {
						user: token.user,
					},
				}, (err, categories) => {
					callback(err, transactions, categories)
				})
			},

			// Compile data
			(transactions, categories, callback) => {

				const categoryNames = {
					total: "All spending"
				};
				const categoryAmounts = {
					total: 0
				};

				// Iterate through categories
				categories.forEach(category => {
					categoryNames[category.guid] = category.name;
					categoryAmounts[category.guid] = 0
				})

				// Setup full & monthly charts
				const full = clone(categoryAmounts)
				const monthly = {}

				// Iterate through transactions
				transactions.forEach(transaction => {

					// Don't handle income or future transactions
					if (transaction.amount > 0) return
					if (Moment().isBefore(transaction.date*1000)) return

					// Get month ID for transaction
					const monthID = Moment(transaction.date*1000).startOf('month').format('X')

					// Initialize monthly object if applicable
					if (!monthly[monthID]) monthly[monthID] = clone(categoryAmounts)

					// Add to monthly
					monthly[monthID].total += transaction.amount
					monthly[monthID][transaction.category] += transaction.amount

					// Add to full
					full.total += transaction.amount
					full[transaction.category] += transaction.amount
				})

				// Remove empty categories
				Object.entries(full).forEach(([categoryKey, amount]) => {
					if (amount === 0) delete categoryNames[categoryKey]
				})

				Secretary.addToResponse(res, "data", { categoryNames, full, monthly }, true)
				callback()
			},

		], err => next(err));
	})

}