/** @namespace api/routes/Transaction */

const Async = require('async')
const Papa = require('papaparse')
const Moment = require('moment-timezone')

const Database = require('./../tools/Database')
const Validation = require('./../tools/Validation')
const Secretary = require('./../tools/Secretary')
const Messages = require('./../tools/Messages')
const Authentication = require('./../tools/Authentication')
const Transaction = require('./../model/Transaction')
const Category = require('./../model/Category')
const Paging = require('../tools/Paging')
const Filter = require('../tools/Filter')

module.exports = router => {

	/**
	 * @api {POST} /transaction.list List
	 * @apiName List
	 * @apiGroup Transaction
	 * @apiDescription Lists transactions
	 * @apiUse TransactionFilter
	 * @apiUse Paging
	 * 
	 * @apiSuccess {Array} transactions Transaction object array
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.list', (req, res, next) => {
		req.handled = true;

		// Setup query
		let query = {};

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					query.user = token.user;
					callback(err);
				});
			},

			// Validate params
			callback => {
				var validations = [];
				Paging.validatePageRequest(req.body, validations)
				Filter.validateTransactionsRequest(req.body, validations)
				callback(Validation.catchErrors(validations))
			},

			// Find transactions
			callback => {
				Filter.filterForTransactionsRequest(query, req.body)
				Paging.page(Transaction, req.body, query, (err, transactions) => {
					Secretary.addToResponse(res, "transactions", transactions)
					callback(err)
				})
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /transaction.sum Sum
	 * @apiName Sum
	 * @apiGroup Transaction
	 * @apiDescription Sums transactions
	 * @apiUse TransactionFilter
	 * 
	 * @apiSuccess {Array} transactions Transaction object array
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.sum', (req, res, next) => {
		req.handled = true;

		// Setup query
		let query = {}

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					query.user = token.user;
					callback(err);
				});
			},

			// Validate params
			callback => {
				var validations = [];
				Filter.validateTransactionsRequest(req.body, validations)
				callback(Validation.catchErrors(validations))
			},

			// Sum transactions
			callback => {
				Filter.filterForTransactionsRequest(query, req.body)
				Database.sum({
					model: Transaction,
					field: 'amount',
					query,
				}, (err, sum) => {
					Secretary.addToResponse(res, "sum", sum, true);
					callback(err)
				})
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /transaction.create Create
	 * @apiName Create
	 * @apiGroup Transaction
	 * @apiDescription Creates and returns a new transaction
	 *
	 * @apiParam {String} description Transaction description
	 * @apiParam {Number} date Transaction date
	 * @apiParam {Number} amount Transaction amount
	 * @apiParam {String} [category] Category GUID
	 *
	 * @apiSuccess {Object} transaction Transaction object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.create', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate parameters
			(token, callback) => {
				var validations = [];
				if (req.body.description) validations.push(Validation.string('Description', req.body.description))
				if (req.body.date) validations.push(Validation.number('Date', req.body.date))
				if (req.body.amount) validations.push(Validation.currency('Amount', req.body.amount))
				if (req.body.category) validations.push(Validation.string('Category', req.body.category))
				if (req.body.categoryName) validations.push(Validation.string('Category name', req.body.categoryName))
				callback(Validation.catchErrors(validations), token)
			},

			// Check that category exists
			(token, callback) => {
				if (req.body.category) {
					Database.findOne({
						'model': Category,
						'query': {
							'guid': req.body.category
						}
					}, (err, category) => {
						if (!category) callback(Secretary.requestError(Messages.conflictErrors.categoryNotFound));
						else callback(err, token, category)
					})
				} else if (req.body.categoryName) {
					Category.findOrCreate({ 
						user: token.user,
						name: req.body.categoryName
					}, (err, category) => {
						callback(err, token, category)
					})
				} else callback(null, token, null);
			},

			// Create a new transaction, add to reply
			(token, category, callback) => {
				let vars = {
					'user': token.user,
					'description': req.body.description,
					'amount': req.body.amount,
					'date': req.body.date,
				};
				if (category) vars.category = category.guid;
				Transaction.create(vars, (err, transaction) => {
					Secretary.addToResponse(res, "transaction", transaction)
					callback(err);
				});
			}

		], err => next(err));
	})

	/**
	 * @api {POST} /transaction.edit Edit
	 * @apiName Edit
	 * @apiGroup Transaction
	 * @apiDescription Edits and returns an existing transaction
	 *
	 * @apiParam {String} guid Transaction GUID
	 * @apiParam {String} [description] Transaction description
	 * @apiParam {Number} [date] Transaction date
	 * @apiParam {Number} [amount] Transaction amount
	 * @apiParam {String} [category] Category GUID
	 *
	 * @apiSuccess {Object} transaction Transaction object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.edit', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate parameters
			(token, callback) => {
				var validations = [
					Validation.string('GUID', req.body.guid)
				];
				if (req.body.description) validations.push(Validation.string('Description', req.body.description))
				if (req.body.date) validations.push(Validation.number('Date', req.body.date))
				if (req.body.amount) validations.push(Validation.currency('Amount', req.body.amount))
				if (req.body.category) validations.push(Validation.string('Category', req.body.category))
				callback(Validation.catchErrors(validations), token)
			},

			// Find transaction to edit
			(token, callback) => {
				Database.findOne({
					'model': Transaction,
					'query': {
						'guid': req.body.guid
					}
				}, (err, transaction) => {
					if (!transaction) callback(Secretary.requestError(Messages.conflictErrors.objectNotFound));
					else callback(err, token, transaction)
				})
			},

			// Check if category exists
			(token, transaction, callback) => {
				if (req.body.category) {
					Database.findOne({
						'model': Category,
						'query': {
							'guid': req.body.category
						}
					}, (err, category) => {
						if (!category) callback(Secretary.requestError(Messages.conflictErrors.categoryNotFound));
						else callback(err, token, transaction, category)
					})
				} else if (req.body.categoryName) {
					Category.findOrCreate({ 
						user: token.user,
						name: req.body.categoryName
					}, (err, category) => {
						callback(err, token, transaction, category)
					})
				} else callback(null, token, transaction, null);
			},

			// Edit transaction, add to reply
			(token, transaction, category, callback) => {
				transaction.edit({
					'user': token.user,
					'description': req.body.description,
					'amount': req.body.amount,
					'date': req.body.date,
					'category': category ? category.guid : undefined,
				}, (err, transaction) => {
					Secretary.addToResponse(res, "transaction", transaction)
					callback(err);
				});
			}
			
		], err => next(err));
	})

	/**
	 * @api {POST} /transaction.delete Delete
	 * @apiName Delete
	 * @apiGroup Transaction
	 * @apiDescription Deletes and returns an existing transaction marked as erased
	 *
	 * @apiParam {String} guid Transaction GUID
	 *
	 * @apiSuccess {Object} transaction Transaction object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.delete', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err);
				});
			},

			// Validate parameters
			(callback) => {
				var validations = [
					Validation.string('GUID', req.body.guid)
				];
				callback(Validation.catchErrors(validations))
			},

			// Find transaction to delete
			(callback) => {
				Database.findOne({
					'model': Transaction,
					'query': {
						'guid': req.body.guid
					}
				}, (err, transaction) => {
					if (!transaction) callback(Secretary.requestError(Messages.conflictErrors.objectNotFound));
					else callback(err, transaction)
				})
			},

			// Delete transaction, add to reply with "erased" property
			(transaction, callback) => {
				transaction.delete((err, transaction) => {
					transaction.erased = true;
					Secretary.addToResponse(res, "transaction", transaction)
					callback(err);
				});
			}
			
		], err => next(err));
	})

	/**
	 * @api {POST} /transaction.import Import
	 * @apiName Import
	 * @apiGroup Transaction
	 * @apiDescription Imports a list of transactions
	 *
	 * @apiParam {String} csv Comma-seperated list of transactions
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.import', (req, res, next) => {
		req.handled = true;

		const categories = {};
		const errors = [];

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate parameters
			(token, callback) => {
				var validations = [
					Validation.csv('CSV', req.body.csv)
				];
				callback(Validation.catchErrors(validations), token)
			},

			// Parse CSV
			(token, callback) => {
				let parsed = Papa.parse(req.body.csv, {
					header: true,
					skipEmptyLines: 'greedy'
				})
				callback(null, token, parsed.data)
			},

			// Create categories for rows
			(token, transactions, callback) => {
				transactions.forEach(transaction => {
					categories[transaction.Category] = ""
				})
				Async.eachOfSeries(categories, (x, name, callback) => {
					Category.findOrCreate({
						'user': token.user,
						'name': name,
					}, (err, category) => {
						categories[name] = category.guid;
						callback(err)
					})
				}, err => callback(err, token, transactions))
			},

			// Create transactions with category
			(token, transactions, callback) => {
				Async.each(transactions, (transaction, callback) => {

					// Validate date
					let date = 0;
					try {
						date = Moment(transaction.Date).format('X')
					} catch(error) {
						errors.push({error, transaction})
						return callback()
					}

					// Create transaction
					Transaction.create({
						user: token.user,
						description: transaction.Description,
						date,
						amount: Number(transaction.Amount.replace(/[^-\.\w]/g, '')),
						category: categories[transaction.Category],
					}, err => callback(err))
				}, err => callback(err))
			},
		], err => {
			Secretary.addToResponse(res, 'errors', errors, true)
			next(err)
		});
	})

	// NYUTC: converts all a user's transaction's date to the Unix timestamp of the first second of the
	// UTC day, assuming the user's transaction's current timestamp looks as expected in America/New_York
	router.post('/transaction.nyutc', (req, res, next) => {
		req.handled = true;
		Async.waterfall([
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},
			(token, callback) => {
				Transaction.find({ user: token.user }).exec((err, transactions) => {
					callback(err, transactions);
				});
			},
			(transactions, callback) => {
				Async.eachOfSeries(transactions, (transaction, key, callback) => {
					transaction.edit({
						date: Moment.tz(transaction.date, "X", "America/New_York").utc().startOf('day').format('X')
					}, (err, t) => {
						console.log(`${t.description}: ${transaction.date} -> ${t.date}`)
						callback(err)
					})
				}, (err) => {
					callback(err)
				})
			}
		], err => {
			console.log(err)
			next(err)
		})
	})

}