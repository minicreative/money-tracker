/** @namespace api/model/Insight */

// Initialize dependencies
const Mongoose = require('mongoose');
const Async = require('async');
const Database = require('./../tools/Database');
const Dates = require('./../tools/Dates');

// Insight Properties: configures properties for database object
function InsightProperties (schema) {
    schema.add({
		'user': {
			'type': String,
			'index': true,
			'required': true,
		},

        // Metadata
        'type': {
            'type': String,
            'required': true,
        },

        // Query filters
		'categories': {
			'type': [String],
			'required': false
		},
		'description': {
			'type': String,
			'required': false
		},
        'startDate': {
			'type': String,
			'required': false
		},
        'endDate': {
			'type': String,
			'required': false
		},
        'parentCategoriesOnly': {
			'type': Boolean,
			'required': false
		}
    });
};

// Insight Static Methods: attaches functionality used by the schema in general
function InsightStaticMethods (schema) {

	/**
	 * Creates a new insight in the database
	 * @memberof api/model/Insight
	 * @param {Object} params
	 * @param {String} params.user GUID of user
     * @param {String} params.type Type of insight
	 * @param {Array} params.categories Category GUIDs query filter
	 * @param {String} params.description Description query filter
     * @param {String} params.startDate Start date query filter (UNIX timestamp)
     * @param {String} params.endDate End date query filter (UNIX timestamp)
     * @param {Boolean} params.parentCategoriesOnly Boolean to show parent categories only
	 * @param {function(err, update)} callback Callback function
	 */
	schema.statics.create = function ({
        user, type, categories, description, startDate, endDate, parentCategoriesOnly
    }, callback) {

		// Save reference to model
		var Insight = this;

		// Synchronously perform the following tasks, then make callback...
		Async.waterfall([

			// Generate a unique GUID
			function (callback) {
				Insight.GUID(function (err, GUID) {
					callback(err, GUID);
				})
			},

			// Write new insight to the database
			function (GUID, callback) {

				// Setup query with GUID
				var query = {
					'guid': GUID
				};

				// Setup database update
                var set = {
                    'guid': GUID,
                    'user': user,
                    'type': type,
                };
				if (categories !== undefined) set.categories = categories;
                if (description !== undefined) set.description = description;
                if (startDate !== undefined) set.startDate = startDate;
                if (endDate !== undefined) set.endDate = endDate;
                if (parentCategoriesOnly !== undefined) set.parentCategoriesOnly = parentCategoriesOnly;

				// Make database update
				Database.update({
					'model': Insight,
					'query': query,
					'update': {
                        '$set': set,
                    },
				}, function (err, insight) {
					callback(err, insight);
				});
			},

		], function (err, insight) {
			callback(err, insight);
		});
	};
};

// Insight Instance Methods: attaches functionality related to existing instances of the object
function InsightInstanceMethods (schema) {

	// /**
	//  * Updates an existing insight
	//  * @memberof api/model/Insight
	//  * @param {Object} params
	//  * @param {function(err, user)} callback Callback function
	//  */
	// schema.methods.edit = function ({
	// 	name, plaidTokens, binanceKey, binanceSecret,
	// }, callback) {

	// 	// Save reference to model
	// 	var User = this;

	// 	// Setup query with GUID
	// 	var query = {
	// 		'guid': this.guid,
	// 	};

	// 	// Setup database update
	// 	var set = {
	// 		'lastModified': Dates.now(),
	// 	};
	// 	if (name) set.name = name;
	// 	if (plaidTokens) set.plaidTokens = plaidTokens;
	// 	if (binanceKey) set.binanceKey = binanceKey;
	// 	if (binanceSecret) set.binanceSecret = binanceSecret;
	// 	var update = {
	// 		'$set': set
	// 	};

	// 	// Make database update
	// 	Database.update({
	// 		'model': User.constructor,
	// 		'query': query,
	// 		'update': update,
	// 	}, function (err, user) {
	// 		callback(err, user);
	// 	});
	// };

};

// Make schema for new insight object...
const insightScheme = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(insightScheme);

// Add insight properties and methods to schema
InsightProperties(insightScheme);
InsightStaticMethods(insightScheme);
InsightInstanceMethods(insightScheme);

// Return new model object
module.exports = Mongoose.model('Insight', insightScheme)