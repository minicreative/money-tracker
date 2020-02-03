/** @namespace model/Category */

// Initialize dependencies
const Mongoose = require('mongoose');
const Async = require('async');
const Database = require('../tools/Database');
const Dates = require('../tools/Dates');

function CategoryProperties (schema) {
    schema.add({
		'user': {
			'type': String,
			'index': true,
			'required': true,
		},
		'name': {
			'type': String,
			'index': true,
			'required': true,
		},
		'parent': {
			'type': String,
			'index': true
		}
    });
};

function CategoryStaticMethods (schema) {

	/**
	 * Creates a new Category in the database
	 * @memberof model/Category
	 * @param {Object} params
	 * @param {String} params.user User GUID
	 * @param {String} params.name Name
	 * @param {String} params.parent Parent category GUIT
	 * @param {function(err, Category)} callback Callback function
	 */
	schema.statics.create = function ({user, name, parent}, callback) {

		// Save reference to model
		var Category = this;

		// Synchronously perform the following tasks, then make callback...
		Async.waterfall([

			// Generate a unique GUID
			function (callback) {
				Category.GUID(function (err, GUID) {
					callback(err, GUID);
				})
			},

			// Write new Category to the database
			function (GUID, callback) {

				// Setup query with GUID
				var query = {
					'guid': GUID
				};

				// Setup database update
				let set = {
					'guid': GUID,
					'user': user,
					'name': name,
					'dateCreated': Dates.now(),
				}
				if (parent) set.parent = parent;
				var update = {
					'$set': set
				};

				// Make database update
				Database.update({
					'model': Category,
					'query': query,
					'update': update,
				}, function (err, category) {
					callback(err, category);
				});
			},

		], function (err, category) {
			callback(err, category);
		});
	};

	/**
	 * Finds an existing a new Category in the database
	 * @memberof model/Category
	 * @param {Object} params
	 * @param {String} params.user User GUID
	 * @param {String} params.name Name
	 * @param {function(err, Category)} callback Callback function
	 */
	schema.statics.findOrCreate = function ({user, name}, callback) {

		// Save reference to model
		var Category = this;

		// Search for category by name, return if exists, create if not
		Database.findOne({
			model: Category,
			query: { name }
		}, (err, category) => {
			if (category) {
				return callback(null, category)
			}
			Category.create({user, name}, (err, category) => {
				callback(err, category);
			})
		})
	};
};

function CategoryInstanceMethods (schema) {

	/**
	 * Updates an existing category
	 * @memberof model/Category
	 * @param {Object} params
	 * @param {String} [params.name] Name
	 * @param {String} [params.parent] Parent
	 * @param {function(err, category)} callback Callback function
	 */
	schema.methods.edit = function ({name, parent}, callback) {

		// Save reference to model
		var Category = this;

		// Setup query with GUID
		var query = {
			'guid': this.guid,
		};

		// Setup database update
		var set = {
			'lastModified': Dates.now(),
			'parent': parent
		};
		if (name) set.name = name;
		var update = {
			'$set': set
		};

		// Make database update
		Database.update({
			'model': Category.constructor,
			'query': query,
			'update': update,
		}, function (err, category) {
			callback(err, category);
		});
	};

};

// Make schema for new category object...
const categorySchema = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(categorySchema);

// Add category properties and methods to schema
CategoryProperties(categorySchema);
CategoryStaticMethods(categorySchema);
CategoryInstanceMethods(categorySchema);

// Return new model object
module.exports = Mongoose.model('Category', categorySchema)