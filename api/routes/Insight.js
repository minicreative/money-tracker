/** @namespace api/routes/Insight */

const Async = require('async')
const Moment = require('moment')

const Database = require('../tools/Database')
const Secretary = require('../tools/Secretary')
const Authentication = require('../tools/Authentication')
const Dates = require('../tools/Dates')
const Filter = require('../tools/Filter')

const Insight = require('../model/Insight')
const Transaction = require('../model/Transaction')
const Category = require('../model/Category')

function clone(object) {
	return JSON.parse(JSON.stringify(object))
}

module.exports = router => {

	/**
	 * @api {POST} /insight.list List
	 * @apiName List
	 * @apiGroup Insight
	 * @apiDescription Lists insights
	 *
	 * @apiSuccess {Array} insights Insight object array
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	 router.post('/insight.list', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Find insights for user
			(token, callback) => {
				const pageOptions = {
					model: Insight,
					sort: 'name',
					pageSize: 100,
					query: {
						user: token.user,
					},
				};
				Database.page(pageOptions, (err, insights) => {
					Secretary.addToResponse(res, "insights", insights);
					callback(err)
				})
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /insight.category Category
	 * @apiName Category
	 * @apiGroup Insight
	 * @apiDescription Get sums by category
	 *
	 * @apiSuccess {Object} categories
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/insight.category', (req, res, next) => {
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
				let query = {
					user: token.user
				}
				Filter.filterForTransactionsRequest(query, req.body)
				Database.find({
					model: Transaction,
					sort: '-date',
					query,
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

				const parentsOnly = req.body.parentCategoriesOnly;
				const categoryNames = {};
				const categoryAmounts = {
					total: 0
				};
				const categoryParents = {}

				// Iterate through categories
				categories.forEach(category => {
					categoryParents[category.guid] = category.parent;
					categoryNames[category.guid] = category.name;
					categoryAmounts[category.guid] = 0
				})

				// Setup full & monthly charts
				const full = clone(categoryAmounts)
				const monthly = {}

				// Setup first transaction
				let firstTransactionTime = Dates.now();

				// Iterate through transactions
				transactions.forEach(transaction => {

					// Don't handle future transactions
					if (Moment().isBefore(transaction.date*1000)) return

					// Track first transaction time
					if (transaction.date < firstTransactionTime) {
						firstTransactionTime = transaction.date
					}

					// Get month ID for transaction
					const monthID = Moment(transaction.date, 'X').utc().startOf('month').format('X')

					// Initialize monthly object if applicable
					if (!monthly[monthID]) monthly[monthID] = clone(categoryAmounts)

					// Get transaction category if parents only
					var parentCategory
					if (parentsOnly) {
						parentCategory = categoryParents[transaction.category]
					}

					// Add to monthly
					monthly[monthID].total += transaction.amount
					if (parentsOnly && parentCategory) monthly[monthID][parentCategory] += transaction.amount
					else monthly[monthID][transaction.category] += transaction.amount

					// Add to full
					full.total += transaction.amount
					if (parentsOnly && parentCategory) full[parentCategory] += transaction.amount
					else full[transaction.category] += transaction.amount
				})

				// Remove empty categories, create averages
				const monthCount = Moment().diff(Moment(firstTransactionTime, 'X'), 'months', true)
				const dayCount = Moment().diff(Moment(firstTransactionTime, 'X'), 'days', true)
				const monthAverage = {
					total: full.total / monthCount
				}
				const dayAverage = {
					total: full.total / dayCount
				}
				Object.entries(full).forEach(([categoryKey, amount]) => {
					if (amount === 0) delete categoryNames[categoryKey]
					else {
						dayAverage[categoryKey] = full[categoryKey] / dayCount
						monthAverage[categoryKey] = full[categoryKey] / monthCount
					}
				})

				Secretary.addToResponse(res, "data", { categoryNames, full, monthly, monthAverage, dayAverage }, true)
				callback()
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /insight.totals Totals
	 * @apiName Totals
	 * @apiGroup Insight
	 * @apiDescription Get totals over time
	 *
	 * @apiSuccess {Object} totals
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/insight.totals', (req, res, next) => {
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
					callback(err, transactions)
				})
			},

			// Compile data
			(transactions, callback) => {

				var months = {}

				// Iterate through transactions
				transactions.forEach(transaction => {

					// Don't handle income or future transactions
					if (transaction.amount > 0) return
					if (Moment().isBefore(Moment(transaction.date, 'X'))) return

					// Exclusion filters
					if (req.body.excludeGifts && 
						(
							transaction.category === 'a2af8852-5f71-4009-9c37-070263452cc3' || // Gifts
							transaction.category === '9e5fc306-84a9-4232-8511-c6012a955540' || // Pets
							transaction.category === '2ef2e6a5-8c26-4051-82b3-10ea0d1d3f29'    // Charity
						)
					) return
					if (req.body.excludeHousing && 
						(
							transaction.category === 'ed8055cc-4031-41b0-bfb1-6be1d885ebe9' || // Rent
							transaction.category === '4b546459-285a-4a87-88de-3a3f5a6d96f5'    // Utilities
						)
					) return
					if (req.body.excludeProperty && 
						(
							transaction.category === '22cd0d59-67b4-4b8b-950d-d11a61303fea' || // Cars
							transaction.category === '93bc9662-f935-4a1d-b80b-5774d48a358c' || // 1841 Montegut
							transaction.category === 'faf71bd4-4bad-453b-b3a2-6dfbe1e547c3'    // Tools
						)
					) return
					if (req.body.excludeInvestment && 
						(
							transaction.category === 'e1d167bd-3db5-4a6f-912c-37ad439e3029'
						)
					) return

					// Get month ID for transaction
					const monthID = Moment(transaction.date, 'X').utc().startOf('month').format('X')

					// Initial month if necessary
					if (months[monthID] === undefined) {
						months[monthID] = 0
					}

					// Add transaction to monthly sum
					months[monthID] += transaction.amount
				})

				// Setup response
				let timestamps = []
				let totals = []
				for (let key in months) {
					if (months.hasOwnProperty(key)) timestamps.push(key)
				}
				timestamps.sort((a, b) => b-a)
				for (let i in timestamps) {
					totals[i] = Math.abs(months[timestamps[i]])
				}

				Secretary.addToResponse(res, "data", { timestamps, totals }, true)
				callback()
			},

		], err => next(err));
	})

}