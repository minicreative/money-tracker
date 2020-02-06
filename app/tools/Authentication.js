/** @namespace tools/Authentication */
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

	logout: () => {
		Storage.clear();
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
