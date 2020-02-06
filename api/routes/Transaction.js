/** @namespace routes/Transaction */

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

module.exports = router => {

	/**
	 * @api {POST} /transaction.list List
	 * @apiName List
	 * @apiGroup Transaction
	 * @apiDescription Lists transactions
	 *
	 * @apiSuccess {Object} transaction Transaction object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.list', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate params
			(token, callback) => {
				var validations = [];
				if (req.body.pageSize) validations.push(Validation.pageSize('Page size', req.body.pageSize))
				callback(Validation.catchErrors(validations), token)
			},

			// Find transactions for user
			(token, callback) => {
				Database.page({
					model: Transaction,
					query: {
						user: token.user
					},
					sort: '-date',
					pageSize: req.body.pageSize,
				}, (err, transactions) => {
					Secretary.addToResponse(res, "transactions", transactions);
					callback(err, transactions)
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
				var validations = [
					Validation.string('Description', req.body.description),
					Validation.number('Date', req.body.date),
					Validation.currency('Amount', req.body.amount),
				];
				if (req.body.category) validations.push(Validation.string('Category', req.body.category))
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
						else callback(err, token, transaction)
					})
				} else callback(null, token, transaction);
			},

			// Edit transaction, add to reply
			(token, transaction, callback) => {
				transaction.edit({
					'user': token.user,
					'description': req.body.description,
					'amount': req.body.amount,
					'date': req.body.date,
					'category': req.body.category,
				}, (err, transaction) => {
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

}