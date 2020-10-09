/** @namespace tools/Filter */
// Filter.js: provides filtering tools

/**
 * @apiDefine TransactionFilter
 * @apiParam {String} [description] Filter for description string
 * @apiParam {Number} [before] Filter transactions before timestamp
 * @apiParam {Number} [after] Filter transactions after timestamp
 * @apiParam {[String]} [category] Filter transactions by list of categories
 * @apiParam {Number} [greaterThan] Filter transactions by amount greater than
 * @apiParam {Number} [lessThan] Filter transactions by amount less than
 */

module.exports = {

	/**
	 * @memberof tools/Filter
	 * @param body Request body
     * @param validations Array of validation errors
	 */
	validateTransactionsRequest: function (body, validations) {

	},

	/**
	 * Updates query with transactions filters
	 * @memberof tools/Filter
     * @param {Object} body Request body
	 */
	filterForTransactionsRequest: function (query, body) {
		if (body.description) {
			query.description = new RegExp(body.description, 'i')
		}
	},
};