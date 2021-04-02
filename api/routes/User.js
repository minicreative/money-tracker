const Async = require('async')
const HashPassword = require('password-hash')
const Plaid = require('plaid')
const Binance = require('node-binance-us-api');

const Database = require('./../tools/Database')
const Validation = require('./../tools/Validation')
const Secretary = require('./../tools/Secretary')
const Messages = require('./../tools/Messages')
const Authentication = require('./../tools/Authentication')

const User = require('./../model/User')

const plaidClient = new Plaid.Client({
	clientID: process.env.mt_plaid_client_id,
	secret: process.env.mt_plaid_secret,
	env: Plaid.environments.development,
});

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
	 * @api {POST} /user.edit Create
	 * @apiName Edit
	 * @apiGroup User
	 * @apiDescription Edits a user based on auth token
	 *
	 * @apiParam {Name} name User's name
	 * 
	 * @apiSuccess {Object} user User object
	 * @apiSuccess {String} token Authentication token
	 *
	 * @apiUse Error
	 */
	router.post('/user.edit', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		let validations = [];
		if (req.body.name) {
			validations.push(Validation.string('Name', req.body.name))
		}
		if (req.body.plaidTokens) {
			validations.push(Validation.array('Plaid tokens', req.body.plaidTokens))
		}
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Get user for token
			(token, callback) => {
				Database.findOne({
					'model': User,
					'query': {
						'guid': token.user
					}
				}, (err, user) => {
					if (!user) callback(Secretary.requestError(Messages.authErrors.invalidToken));
					else callback(err, user)
				})
			},

			// Edit user, add to reply
			(user, callback) => {
				user.edit({
					'name': req.body.name,
					'plaidTokens': req.body.plaidTokens,
				}, (err, user) => {
					if (user) Secretary.addToResponse(res, "user", user)
					callback(err, user);
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
	 * @api {POST} /user.plaidLinkToken Get Plaid Link Token
	 * @apiName Get Plaid Link Token
	 * @apiGroup User
	 * @apiDescription Get a Plaid Link token
	 *
	 * @apiSuccess {String} token Plaid link token
	 *
	 * @apiUse Error
	 */
	router.post('/user.plaidLinkToken', (req, res, next) => {
		req.handled = true;

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

	/**
	 * @api {POST} /user.savePlaidToken Save Plaid Token
	 * @apiName Save Plaid Token
	 * @apiGroup User
	 * @apiDescription Save a public Plaid token as an access token
	 * 
	 * @apiParam {String} plaidToken Public Plaid token
	 *
	 * @apiUse Error
	 */
	router.post('/user.savePlaidToken', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.string('Plaid token', req.body.plaidToken),
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Get user for token
			(token, callback) => {
				Database.findOne({
					'model': User,
					'query': {
						'guid': token.user
					}
				}, (err, user) => {
					if (!user) callback(Secretary.requestError(Messages.authErrors.invalidToken));
					else callback(err, user)
				})
			},

			// Exchange public token for access token
			(user, callback) => {
				plaidClient.exchangePublicToken(publicToken)
					.then(response => callback(null, user, response.access_token))
					.catch(err => callback(err))
			},

			// Save access token in user
			(user, accessToken, callback) => {
				let { plaidTokens } = user
				plaidTokens.push(accessToken)
				user.edit({
					plaidTokens,
				}, (err, user) => {
					if (user) Secretary.addToResponse(res, "user", user)
					callback(err);
				});
			},

		], err => next(err));
	})

		/**
	 * @api {POST} /user.saveBinanceKeys Save Binance Keys
	 * @apiName Save Binance Keys
	 * @apiGroup User
	 * @apiDescription Save a Binance API Key and Secret Key for a user
	 * 
	 * @apiParam {String} binanceKey Binance API Key
	 * @apiParam {String} binanceSecret Binance Secret Key
	 *
	 * @apiUse Error
	 */
	router.post('/user.saveBinanceKeys', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.string('Binance key', req.body.binanceKey),
			Validation.string('Binance secret', req.body.binanceSecret),
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Get user for token
			(token, callback) => {
				Database.findOne({
					'model': User,
					'query': {
						'guid': token.user
					}
				}, (err, user) => {
					if (!user) callback(Secretary.requestError(Messages.authErrors.invalidToken));
					else callback(err, user)
				})
			},

			// Save access token in user
			(user, callback) => {
				user.edit({
					binanceKey: req.body.binanceKey,
					binanceSecret: req.body.binanceSecret,
				}, (err, user) => {
					if (user) Secretary.addToResponse(res, "user", user)
					callback(err);
				});
			},

		], err => next(err));
	})

	/**
	 * @api {POST} /user.accounts Accounts
	 * @apiName Accounts
	 * @apiGroup User
	 * @apiDescription Get a user's accounts and balances
	 *
	 * @apiSuccess {Array} accounts Array of account objects
	 *
	 * @apiUse Error
	 */
	router.post('/user.accounts', (req, res, next) => {
		req.handled = true;

		let accounts = [];
		let holdings = [];

		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Get user for token
			(token, callback) => {
				Database.findOne({
					'model': User,
					'query': {
						'guid': token.user
					}
				}, (err, user) => {
					if (!user) callback(Secretary.requestError(Messages.authErrors.invalidToken));
					else callback(err, user)
				})
			},

			// Get Plaid accounts (if applicable)
			(user, callback) => {
				if (user.plaidTokens.length < 1) return callback(null, user)
				Async.each(user.plaidTokens, (accessToken, callback) => {
					plaidClient.getAccounts(accessToken)
						.then(response => {
							accounts = accounts.concat(response.accounts)
							callback()
						})
						.catch(err => callback(err))
				}, err => callback(err, user))
			},

			// Get Binance balances
			(user, callback) => {
				if (!user.binanceKey || !user.binanceSecret) return callback()
				const binanceClient = new Binance({
					APIKEY: user.binanceKey,
					APISECRET: user.binanceSecret,
				});
				binanceClient.balance((err, balances) => {
					if (err) return callback(err)
					for (let symbol in balances) {
						if (balances[symbol].available > 0) {
							holdings.push({
								symbol,
								amount: balances[symbol].available
							})
						}
					}
					binanceClient.prices((err, prices) => {
						if (err) return callback(err)
						for (let i in holdings) {
							holdings[i].price = prices[holdings[i].symbol+"USD"]
							holdings[i].value = holdings[i].amount * holdings[i].price;
						}
						callback()
					})
				});
			},

			// Attach to response
			callback => {
				Secretary.addToResponse(res, "accounts", accounts, true)
				Secretary.addToResponse(res, "holdings", holdings, true)
				callback()
			}

		], err => next(err));
	})

}
