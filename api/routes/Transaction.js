const Async = require('async')
const HashPassword = require('password-hash')

const Database = require('./../tools/Database')
const Validation = require('./../tools/Validation')
const Secretary = require('./../tools/Secretary')
const Messages = require('./../tools/Messages')
const Authentication = require('./../tools/Authentication')

const Transaction = require('./../model/Transaction')

module.exports = router => {

	/**
	 * @api {POST} /transaction.create Create
	 * @apiName Create
	 * @apiGroup Transaction
	 * @apiDescription Creates and returns a new transaction
	 *
	 * @apiParam {String} description Transaction description
	 * @apiParam {Number} date Transaction date
	 * @apiParam {Number} amount Transaction amount
	 * @apiParam {String} category Category GUID
	 *
	 * @apiSuccess {Object} transaction Transaction object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/transaction.create', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.string('Description', req.body.description),
			Validation.number('Date', req.body.date),
			Validation.currency('Amount', req.body.amount),
			Validation.string('Category', req.body.category)
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Check that category exists
			// (token, callback) => {
			// },

			// Create a new user, add to reply
			(token, callback) => {
				Transaction.create({
					'user': token.user,
					'description': req.body.description,
					'amount': req.body.amount,
					'date': req.body.date,
					'category': req.body.category
				}, (err, transaction) => {
					Secretary.addToResponse(res, "transaction", transaction)
					callback(err);
				});
			}

		], err => next(err));
	})

}