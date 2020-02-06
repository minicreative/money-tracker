/** @namespace tools/Authentication */
// Authentication.js: authenticates user

// Initialize dependencies
const Token = require('jsonwebtoken');
const Dates = require('./Dates');
const Secretary = require('./Secretary');
const Messages = require('./Messages');

// Initialize config
const config = require('./../../config');

// Helper functions
function getTokenFromRequest (request) {
	if (!request.headers) return null;
	return request.headers.authorization;
};

module.exports = {

	/**
	 * Creates a token using a user object
	 * @memberof tools/Authentication
	 * @param {object} user User model object
	 * @param {function(err, encodedToken)} callback Callback function
	*/
	makeUserToken: (user, callback) => {
		const signedObject = {
			'user': user.guid,
			'exp': parseInt(Dates.fromNow(60, 'days')),
		};
		Token.sign(signedObject, config.secret, function (err, token) {
			callback(err, token);
		});
	},

	/**
	 * Produces an authentication error or returns a decoded token for a user
	 * @memberof tools/Authentication
	 * @param {object} request Express.js request object
	 * @param {function(err, decodedToken)} callback Callback function
	 */
	authenticateUser: (request, callback) => {
		const token = getTokenFromRequest(request);
		if (!token) return callback(Secretary.authorizationError(Messages.authErrors.missingToken));
		const pureToken = token.replace('Bearer ', '');
		Token.verify(pureToken, config.secret, function (err, decodedToken) {
			if (decodedToken) return callback(null, decodedToken);
			callback(Secretary.authorizationError(Messages.authErrors.unauthorized));
		});
	},
}