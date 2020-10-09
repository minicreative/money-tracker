/** @namespace tools/Utilities */
// Utilities.js: provides basic tools

module.exports = {

	/**
	 * Deep clones an object
	 * @memberof tools/Utilities
     * @param {Object} object Object to clone
	 * @return {Object} Cloned object
	 */
	clone: function (object) {
		return JSON.parse(JSON.stringify(object));
	},
};