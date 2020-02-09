/** @namespace model/Transaction */

// Initialize dependencies
const Mongoose = require('mongoose')
const Async = require('async')
const Database = require('../tools/Database')
const Dates = require('../tools/Dates')

// Initialize models
const Category = require('./Category')

function TransactionProperties (schema) {
    schema.add({
		'user': {
			'type': String,
			'index': true,
			'required': true,
		},
		'description': {
			'type': String,
			'index': true,
		},
		'date': {
			'type': Number,
			'required': true,
		},
		'amount': {
			'type': Number,
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
				let set = {
					'guid': GUID,
					'user': user,
					'description': description,
					'date': date,
					'amount': amount,
					'lastModified': Dates.now(),
				};
				if (category) set.category = category;
				let update = {
					'$set': set
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
	 * @param {String} params.category Category GUID
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
		if (category) set.category = category;
		if (description) set.description = description;
		if (date) set.date = date;
		if (amount) set.amount = amount;
		var update = {
			'$set': set
		};

		// Make database update
		Database.update({
			'model': Transaction.constructor,
			'query': query,
			'update': update,
		}, function (err, transaction) {
			callback(err, transaction);
		});
	};

	/**
	 * Deletes an existing transaction
	 * @memberof model/Transaction
	 * @param {function(err, transaction)} callback Callback function
	 */
	schema.methods.delete = function (callback) {

		// Save reference to model
		var Transaction = this;

		Transaction.deleteOne({
			'guid': this.guid,
		}, function (err, transaction) {
			callback(err, transaction);
		});
	};

	/**
	 * Updates an existing transaction
	 * @memberof model/Transaction
	 * @param {function(err, transaction)} callback Callback function
	 */
	schema.methods.format = function (callback) {

		// Initialize formatted object
		var thisObject = this.toObject();

		Async.waterfall([

			// Attach category metadata
			function (callback) {
				Database.findOne({
					'model': Category,
					'query': {
						'guid': thisObject.category,
					}
				}, function (err, category) {
					if (category) {
						thisObject.categoryName = category.name;
					}
					callback();
				});
			},

		], function (err) {
			callback(err, thisObject);
		})
	};

};

// Make schema for new transaction object...
const transactionSchema = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(transactionSchema);

// Add transaction properties and methods to schema
TransactionProperties(transactionSchema);
TransactionStaticMethods(transactionSchema);
TransactionInstanceMethods(transactionSchema);

// Return new model object
module.exports = Mongoose.model('Transaction', transactionSchema)