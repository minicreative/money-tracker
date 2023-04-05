/** @namespace app/tools/Authentication */
import Storage from './Storage';

export default {

	/**
	 * Stores the user and token properties of a response from the server
	 * @memberof modules/Authentication
	 * @param {Object} body Server response
	 */
	handleResponse: body => {
		if (body.token) Storage.set('token', body.token);
		if (body.user) Storage.set('user', body.user);
	},

	/**
	 * Handles an authentication error
	 * @memberof modules/Authentication
	 * @param {Object} body Server response
	 */
	handleError: body => {
		Storage.clear();
		window.location.href = "/"
	},

	logout: () => {
		Storage.clear();
	},

	/**
	 * Returns authentication boolean
	 * @memberof modules/Authentication
	 * @return {Boolean} Is authenticated
	 */
	isAuthenticated: () => {
		return Storage.get('token') || false
	},

	/**
	 * Returns authentication token
	 * @memberof modules/Authentication
	 * @return {String} Authentication token
	 */
	getToken: () => {
		return Storage.get('token')
	},

	/**
	 * Returns user object
	 * @memberof modules/Authentication
	 * @return {String} User object
	 */
	getUser: () => {
		return Storage.get('user')
	},
}
