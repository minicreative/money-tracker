/** @namespace tools/Database */
// Database.js: provides tools for accessing / updating the database

// Import dependencies
const Mongoose = require('mongoose')

// Import config variables
const { username, password, host, name } = require('./../../config').database

module.exports = {

	/**
	 * Finds a single object in the database using model
	 * @memberof tools/Database
	 * @param {Object} params
	 * @param {Object} params.model Mongoose model object
	 * @param {Object} params.query MongoDB query object
	 * @param {function (err, object)} callback Callback function
	 */
	findOne: ({model, query}, callback) => {
		model.findOne(query, function (err, object) {
			callback(err, object);
		});
	},

	/**
	 * Finds all objects in the database for a query using model
	 * @memberof tools/Database
	 * @param {Object} params
	 * @param {Object} params.model Mongoose model object
	 * @param {Object} params.query MongoDB query object
	 * @param {function (err, objects)} callback Callback function
	 */
	find: ({model, query}, callback) => {
		model.find(query, function (err, objects) {
			callback(err, objects);
		});
	},

	/**
	 * Finds a limited, sorted list of objects in the database using model
	 * @memberof tools/Database
	 * @param {Object} params
	 * @param {Object} params.model Mongoose model object
	 * @param {Object} params.query MongoDB query object
	 * @param {Number} params.pageSize Number of objects needed
	 * @param {String} params.sort Object property to sort by
	 * @param {Number} params.skip Number of objects to skip at the beginning of sorted query
	 * @param {function (err, objects)} callback Callback function
	 */
	page: ({model, query, pageSize, sort, skip}, callback) => {
		model.find(query).sort(sort).skip(skip).limit(pageSize).exec(function (err, objects) {
			callback(err, objects);
		});
	},

	/**
	 * Queries and updates an object in the database using model
	 * @memberof tools/Database
	 * @param {Object} params
	 * @param {Object} params.model Mongoose model object
	 * @param {Object} params.query MongoDB query object
	 * @param {Number} params.update MongoDB update query object
	 * @param {function (err, object)} callback Callback function
	 */
	update: ({model, query, update}, callback) => {

		// Setup options
		var options = {
			'setDefaultsOnInsert': true, // Adds default properties to database object
			'runValidators': true, // Allows mongoDB to validate update
			'new': true, // Returns the modified document
			'upsert': true, // If a document isn't found, make one based on query
		};

		// Setup query
		if (!update.$set) update.$set = {}; // Make a set operation if one isn't defined in the update
		if (!update.$setOnInsert) update.$setOnInsert = {}; // Make a setOnInsert operation if one isn't defined in the update

		// Make query and update with Mongoose
		model.findOneAndUpdate(query, update, options, function (err, object) {
			callback(err, object);
		});
	},

	/**
	 * Queries and updates an object in the database using model
	 * @memberof tools/Database
	 * @param {Object} params
	 * @param {Object} params.model Mongoose model object
	 * @param {Object} params.query MongoDB query object
	 * @param {Number} params.update MongoDB update query object
	 * @param {function (err, object)} callback Callback function
	 */
	setup: () => {
		process.stdout.write(`Connecting to Mongo at ${host}...`)
		let auth = ''
		if (username && password) auth = `${username}:${password}@`
		return Mongoose.connect(`mongodb://${auth}${host}/${name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		}).then(() => {
			process.stdout.write(' done!\n')
		}).catch(err => {
			process.stderr.write('Database error: '+err.stack+'\n')
			process.exit(0)
		})
	},
}

