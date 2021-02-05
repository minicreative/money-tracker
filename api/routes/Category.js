/** @namespace api/routes/Category */

const Async = require('async')

const Database = require('../tools/Database')
const Validation = require('../tools/Validation')
const Secretary = require('../tools/Secretary')
const Messages = require('../tools/Messages')
const Authentication = require('../tools/Authentication')

const Category = require('../model/Category')

module.exports = router => {

	/**
	 * @api {POST} /category.list List
	 * @apiName List
	 * @apiGroup Category
	 * @apiDescription Lists categories
	 *
	 * @apiSuccess {Array} categories Category object array
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/category.list', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Find categories for user
			(token, callback) => {
				const pageOptions = {
					model: Category,
					sort: 'name',
					pageSize: 100,
					query: {
						user: token.user,
					},
				};
				Database.page(pageOptions, (err, categories) => {
					Secretary.addToResponse(res, "categories", categories);
					callback(err)
				})
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /category.create Create
	 * @apiName Create
	 * @apiGroup Category
	 * @apiDescription Creates and returns a new cateogry
	 *
	 * @apiParam {String} name Category name
	 * @apiParam {String} [parent] Category parent GUID
	 *
	 * @apiSuccess {Object} category Category object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/category.create', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate fields
			(token, callback) => {
				var validations = [
					Validation.string('Name', req.body.name),
				];
				if (req.body.parent) validations.push(Validation.string('Parent', req.body.parent))
				if (req.body.parentName) validations.push(Validation.string('Parent name', req.body.parentName))
				callback(Validation.catchErrors(validations), token)
			},

			// Check that parent category exists
			(token, callback) => {
				if (req.body.parent) {
					Database.findOne({
						'model': Category,
						'query': {
							'guid': req.body.parent
						}
					}, (err, parent) => {
						if (!parent) callback(Secretary.requestError(Messages.conflictErrors.parentCategoryNotFound));
						else callback(err, token, parent)
					})
				} else if (req.body.parentName && req.body.parentName.length > 0) { // Need to figure this out
					Category.findOrCreate({
						'user': token.user,
						'name': req.body.parentName,
					}, (err, parent) => {
						callback(err, token, parent)
					})
				} else callback(null, token, null);
			},

			// Create a new category, add to reply
			(token, parent, callback) => {
				let vars = {
					'user': token.user,
					'name': req.body.name,
					'income': req.body.income ? true : false,
				};
				if (parent) vars.parent = parent.guid;
				Category.create(vars, (err, category) => {
					Secretary.addToResponse(res, 'category', category)
					callback(err);
				});
			}
		], err => next(err));
	})

	/**
	 * @api {POST} /category.edit Edit
	 * @apiName Edit
	 * @apiGroup Category
	 * @apiDescription Edits and returns an existing cateogry
	 *
	 * @apiParam {String} guid Category GUID
	 * @apiParam {String} [name] Category name
	 * @apiParam {String} [parent] Category parent GUID
	 *
	 * @apiSuccess {Object} category Category object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/category.edit', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate fields
			(token, callback) => {
				var validations = [
					Validation.string('GUID', req.body.guid)
				];
				if (req.body.name) validations.push(Validation.string('Name', req.body.name))
				if (req.body.parent) validations.push(Validation.string('Parent', req.body.parent))
				if (req.body.guid === req.body.parent)
					return callback(Secretary.requestError(Messages.conflictErrors.invalidParentCategory))
				callback(Validation.catchErrors(validations), token)
			},

			// Find category to edit
			(token, callback) => {
				Database.findOne({
					'model': Category,
					'query': {
						'guid': req.body.guid
					}
				}, (err, category) => {
					if (!category) callback(Secretary.requestError(Messages.conflictErrors.objectNotFound));
					else callback(err, token, category)
				})
			},

			// Check that parent exists
			(token, category, callback) => {
				if (req.body.parent) {
					Database.findOne({
						'model': Category,
						'query': {
							'guid': req.body.parent
						}
					}, (err, parent) => {
						if (!parent) callback(Secretary.requestError(Messages.conflictErrors.parentCategoryNotFound));
						else callback(err, token, category, parent)
					})
				} else if (req.body.parentName && req.body.parentName.length > 0) { // Need to figure this out
					Category.findOrCreate({
						'user': token.user,
						'name': req.body.parentName,
					}, (err, parent) => {
						callback(err, token, category, parent)
					})
				} else callback(null, token, category, null);
			},

			// Edit category, add to reply
			(token, category, parent, callback) => {
				category.edit({
					'name': req.body.name,
					'income': req.body.income ? true : false,
					'parent': parent ? parent.guid : null,
				}, (err, category) => {
					Secretary.addToResponse(res, 'category', category)
					callback(err);
				});
			}
		], err => next(err));
	})

	/**
	 * @api {POST} /category.delete Delete
	 * @apiName Delete
	 * @apiGroup Category
	 * @apiDescription Deletes and returns an existing category marked as erased
	 *
	 * @apiParam {String} guid Category GUID
	 *
	 * @apiSuccess {Object} category Category object
	 *
	 * @apiUse Authorization
	 * @apiUse Error
	 */
	router.post('/category.delete', (req, res, next) => {
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

			// Find category to delete
			(callback) => {
				Database.findOne({
					'model': Category,
					'query': {
						'guid': req.body.guid
					}
				}, (err, category) => {
					if (!category) callback(Secretary.requestError(Messages.conflictErrors.objectNotFound));
					else callback(err, category)
				})
			},

			// Delete category, add to reply with "erased" property
			(category, callback) => {
				category.delete((err, category) => {
					category.erased = true;
					Secretary.addToResponse(res, "category", category)
					callback(err);
				});
			}
			
		], err => next(err));
	})

}