/** @namespace tools/Authentication */
// Authentication.js: authenticates user

// Initialize dependencies
const Token = require('jsonwebtoken');
const Dates = require('./Dates');
const Secretary = require('./Secretary');
const Messages = require('./Messages');

// Initialize config
const config = require('./../../config');

module.exports = {

	/**
	 * Creates a token using a user object
	 * @memberof tools/Authentication
	 * @param {object} user User model object
	 * @param {function(err, encodedToken)} callback Callback function
	*/
	makeUserToken: (user, callback) => {
		var signedObject = {
			'user': user.guid,
			'exp': parseInt(Dates.fromNow(60, 'days')),
		};
		Token.sign(signedObject, config.secret, function (err, token) {
			callback(err, token);
		});
	},

	/**
	 * Returns the token from a request object
	 * @memberof tools/Authentication
	 * @param {object} request Express.js request object
	 * @return {string} Encoded token
	 */
	getTokenFromRequest: (request) => {
		if (!request.headers) return null;
		return request.headers.authorization;
	},

	/**
	 * Produces an authentication error or returns a decoded token for a user
	 * @memberof tools/Authentication
	 * @param {object} request Express.js request object
	 * @param {function(err, decodedToken)} callback Callback function
	 */
	authenticateUser: (request, callback) => {
		var token = getTokenFromRequest(request);
		if (!token) return callback(Secretary.authorizationError(Messages.authErrors.missingToken));
		Token.verify(token, config.secret, function (err, decodedToken) {
			if (decodedToken) return callback(null, decodedToken);
			callback(Secretary.authorizationError(Messages.authErrors.unauthorized));
		});
	},
}