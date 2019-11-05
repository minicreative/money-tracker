/** @namespace model/Transaction */

// Initialize dependencies
const Mongoose = require('mongoose');
const Async = require('async');
const Database = require('../tools/Database');
const Dates = require('../tools/Dates');

function TransactionProperties (schema) {
    schema.add({
		'user': {
			'type': String,
			'index': true,
			'required': true,
		},
		'description': {
			'type': String,
			'required': true,
			'index': true,
		},
		'date': {
			'type': Number,
			'required': true,
		},
		'amount': {
			'type': Number,
			'required': true,
		},
		'category': {
			'type': String,
		}
    });
};

function TransactionStaticMethods (schema) {

	/**
	 * Creates a new transaction in the database
	 * @memberof model/Transaction
	 * @param {Object} params
	 * @param {String} params.user User GUID
	 * @param {String} params.description Description
	 * @param {Number} params.date Date
	 * @param {Number} params.amount Amount
	 * @param {String} params.category Category GUID
	 * @param {function(err, transaction)} callback Callback function
	 */
	schema.statics.create = function ({user, description, date, amount, category}, callback) {

		// Save reference to model
		var Transaction = this;

		// Synchronously perform the following tasks, then make callback...
		Async.waterfall([

			// Generate a unique GUID
			function (callback) {
				Transaction.GUID(function (err, GUID) {
					callback(err, GUID);
				})
			},

			// Write new transaction to the database
			function (GUID, callback) {

				// Setup query with GUID
				var query = {
					'guid': GUID
				};

				// Setup database update
				var update = {
					'$set': {
						'guid': GUID,
						'user': user,
						'description': description,
						'date': date,
						'amount': amount,
						'category': category,
						'dateCreated': Dates.now(),
					}
				};

				// Make database update
				Database.update({
					'model': Transaction,
					'query': query,
					'update': update,
				}, function (err, transaction) {
					callback(err, transaction);
				});
			},

		], function (err, transaction) {
			callback(err, transaction);
		});
	};
};

function TransactionInstanceMethods (schema) {

	/**
	 * Updates an existing transaction
	 * @memberof model/Transaction
	 * @param {Object} params
	 * @param {String} [params.description] Description
	 * @param {Number} [params.date] Date
	 * @param {Number} [params.amount] Amount
	 * @param {String} [params.category] Category GUID
	 * @param {function(err, transaction)} callback Callback function
	 */
	schema.methods.edit = function ({description, date, amount, category}, callback) {

		// Save reference to model
		var Transaction = this;

		// Setup query with GUID
		var query = {
			'guid': this.guid,
		};

		// Setup database update
		var set = {
			'lastModified': Dates.now(),
		};
		if (description) set.description = description;
		if (date) set.date = date;
		if (amount) set.amount = amount;
		if (category) set.category = category;
		var update = {
			'$set': set
		};

		// Make database update
		Database.update({
			'model': User.constructor,
			'query': query,
			'update': update,
		}, function (err, user) {
			callback(err, user);
		});
	};

};

// Make schema for new user object...
const transactionSchema = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(transactionSchema);

// Add user properties and methods to schema
TransactionProperties(transactionSchema);
TransactionStaticMethods(transactionSchema);
TransactionInstanceMethods(transactionSchema);

// Return new model object
module.exports = Mongoose.model('Transaction', transactionSchema)