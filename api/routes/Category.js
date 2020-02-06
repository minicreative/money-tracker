/** @namespace routes/Category */

const Async = require('async')

const Database = require('../tools/Database')
const Validation = require('../tools/Validation')
const Secretary = require('../tools/Secretary')
const Messages = require('../tools/Messages')
const Authentication = require('../tools/Authentication')

const Category = require('../model/Category')

module.exports = router => {

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
				} else callback(null, token, null);
			},

			// Create a new category, add to reply
			(token, parent, callback) => {
				let vars = {
					'user': token.user,
					'name': req.body.name,
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
				callback(Validation.catchErrors(validations), token)
			},

			// Data validation
			(token, callback) => {
				if (req.body.guid === req.body.parent)
					return callback(Secretary.requestError(Messages.conflictErrors.invalidParentCategory))
				callback(null, token)
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
				} else callback(null, token, category, null);
			},

			// Edit category, add to reply
			(token, category, parent, callback) => {
				category.edit({
					'name': req.body.name,
					'parent': req.body.parent,
				}, (err, category) => {
					Secretary.addToResponse(res, 'category', category)
					callback(err);
				});
			}
		], err => next(err));
	})

}