/** @namespace tools/Storage */

const Storage = {

	/**
	 * Stores an item in localStorage
	 * @memberof modules/Storage
	 * @param {String} key Key to reference value
	 * @param {Object} json Value to store under key
	 */
	set: function (key, json) {
		var value = JSON.stringify(json);
		window.localStorage.setItem(key, value);
	},
	/**
	 * Accesses an item in localStorage
	 * @memberof modules/Storage
	 * @param {String} key Key to reference value
	 */
	get: function (key) {
		var value = window.localStorage.getItem(key);
		return JSON.parse(value);
	},
	/**
	 * Clears all items in localStorage
	 * @memberof modules/Storage
	 */
	clear: function () {
		window.localStorage.clear();
	},
};

export default Storage