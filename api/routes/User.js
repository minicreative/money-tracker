const Async = require('async')
const HashPassword = require('password-hash')
const Plaid = require('plaid')

const Database = require('./../tools/Database')
const Validation = require('./../tools/Validation')
const Secretary = require('./../tools/Secretary')
const Messages = require('./../tools/Messages')
const Authentication = require('./../tools/Authentication')

const User = require('./../model/User')

module.exports = router => {

	/**
	 * @api {POST} /user.get Get
	 * @apiName Get
	 * @apiGroup User
	 * @apiDescription Get a user using authentication token
	 *
	 * @apiParam {String} token User's token
	 *
	 * @apiSuccess {Object} user User object
	 *
	 * @apiUse Error
	 */
	router.post('/user.get', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Find and return user from token
			(token, callback) => {
				Database.findOne({
					'model': User,
					'query': {
						'guid': token.user,
					},
				}, (err, user) => {
					if (!user) return callback(Secretary.conflictError(Messages.authErrors.invalidToken));
					Secretary.addToResponse(res, 'user', user);
					callback();
				});
			}

		], err => next(err));
	})

	/**
	 * @api {POST} /user.create Create
	 * @apiName Create
	 * @apiGroup User
	 * @apiDescription Creates a new user, returns authentication and new user
	 *
	 * @apiParam {String} name User's name
	 * @apiParam {String} email User's email address
	 * @apiParam {String} password User's password (min. 8 characters, numbers and letter required)
	 *
	 * @apiSuccess {Object} user User object
	 * @apiSuccess {String} token Authentication token
	 *
	 * @apiUse Error
	 */
	router.post('/user.create', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.email('Email', req.body.email),
			Validation.password('Password', req.body.password),
			Validation.string('Name', req.body.name)
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Hash password
		var password = HashPassword.generate(req.body.password);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Check if email is unique
			callback => {
				Database.findOne({
					'model': User,
					'query': {
						'email': req.body.email,
					},
				}, (err, user) => {
					if (user) callback(Secretary.conflictError(Messages.conflictErrors.emailAlreadyUsed));
					else callback(err);
				});
			},

			// Create a new user, add to reply
			callback => {
				User.create({
					'name': req.body.name,
					'email': req.body.email,
					'password': password,
				}, (err, user) => {
					if (user) Secretary.addToResponse(res, "user", user)
					callback(err, user);
				});
			},

			// Create an authentication token for user, add to reply
			(user, callback) => {
				Authentication.makeUserToken(user, (err, token) => {
					if (token) Secretary.addToResponse(res, "token", token, true)
					callback(err);
				});
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /user.login Login
	 * @apiName Login
	 * @apiGroup User
	 * @apiDescription Return authentication and user
	 *
	 * @apiParam {String} email User's email address
	 * @apiParam {String} password User's password (min. 8 characters, numbers and letter required)
	 *
	 * @apiSuccess {Object} user User object
	 * @apiSuccess {String} token Authentication token
	 *
	 * @apiUse Error
	 */
	router.post('/user.login', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.email('Email', req.body.email),
			Validation.password('Password', req.body.password)
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Hash password
		var password = HashPassword.generate(req.body.password);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Find user with email
			callback => {
				Database.findOne({
					'model': User,
					'query': {
						'email': req.body.email,
					},
				}, (err, user) => {
					if (!user) callback(Secretary.conflictError(Messages.conflictErrors.emailNotFound));
					else callback(err, user);
				});
			},

			// Check password, add to request if correct
			(user, callback) => {
				if (HashPassword.verify(req.body.password, user.password)) {
					callback(null, user);
					Secretary.addToResponse(res, "user", user);
				} else {
					callback(Secretary.conflictError(Messages.conflictErrors.passwordIncorrect));
				}
			},

			// Create an authentication token for user, add to reply
			(user, callback) => {
				Authentication.makeUserToken(user, (err, token) => {
					if (token) Secretary.addToResponse(res, "token", token, true)
					callback(err);
				});
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /user.plaidToken Plaid Token
	 * @apiName Plaid Token
	 * @apiGroup User
	 * @apiDescription Get a Plaid token
	 *
	 * @apiSuccess {String} token Plaid link token
	 *
	 * @apiUse Error
	 */
	router.post('/user.plaidToken', (req, res, next) => {
		req.handled = true;

		let plaidClient = new Plaid.Client({
			clientID: process.env.mt_plaid_client_id,
			secret: process.env.mt_plaid_secret,
			env: Plaid.environments.development,
		});

		Async.waterfall([
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},
			(token, callback) => {
				plaidClient.createLinkToken({
					user: {
						client_user_id: token.user,
					},
					client_name: 'Money Tracker',
					products: ['auth', 'transactions'],
					country_codes: ['US'],
					language: 'en',
				}, (err, plaidRes) => {
					if (err) return callback(err)
					Secretary.addToResponse(res, "plaidToken", plaidRes.link_token, true)
					callback()
				});
			}
		], err => next(err));
	})

}
