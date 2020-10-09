/** @namespace tools/Paging */
// Paging.js: provides tools for paging

const Database = require("./Database")
const Utilities = require("./Utilities")

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 400;

/**
 * @apiDefine Paging
 * @apiParam {Number} [pageSize = 20] Number of objects to get back (min 1, max 400)
 * @apiParam {String} [sort = "desc"] Ascending (asc) or descending (desc) sort order
 * @apiParam {String} [sortKey = "dateCreated"] Object property to sort by
 * @apiParam {Number} [pageNumber = 0] Page number for paging by index
 * @apiParam {Number} [pageFrom] Date of last object for paging by date
 */

module.exports = {
    
    /**
	 * Adds validation for paging parameters
	 * @memberof tools/Paging
	 * @param body Request body
     * @param validations Array of validation errors
	 */
    validatePageRequest: (body, validations) => {

	},

    /**
     * Setup and call database page function
     * @memberof tools/Paging
     * @param model Database model
     * @param body Request body
     * @param query Query for objects
     * @param {function (err, objects)} callback Callback function
     */
	page: function (model, body, query, callback) {

        // Setup page size
        let pageSize = DEFAULT_PAGE_SIZE
        if (body.pageSize) pageSize = body.pageSize

        // Setup sort using sort and sortKey
        let sort = "-date";
        if (body.sort && body.sortKey) {
            if (body.sort === "desc") {
                sort = "-"
            }
            sort += body.sortKey
        }

        // Setup paging
        let skip = 0
        if (body.pageFrom) {
            query.date = {
                $lt: body.pageFrom
            }
        } else if (body.pageNumber) {
            skip = body.pageNumber * pageSize
        }

        Database.page({model, query, pageSize, sort, skip}, callback)
    },
};