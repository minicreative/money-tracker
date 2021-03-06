/** @namespace app/tools/Validation */

const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

const Validation = {

	/**
	 * @memberof app/tools/Validation Updates state parameter with keyed errors
	 * @param {object} fields Object of field configurations
	 * @param {object} state Form state containing field values
	 */
	validateFormState: function (fields, state) {
		state.fieldErrors = {};
		this.validateFieldLengths(fields, state);
		this.validateConfirmPasswordMatches(fields, state);
		this.validateEmails(fields, state);
	},

	/**
	 * @memberof app/tools/Validation
	 * @param {object} fields Object of field configurations
	 * @param {object} state Form state containing field values
	 */
	validateFieldLengths: function (fields, state) {
		Object.entries(fields).forEach(([key, field]) => {
			if (field.minLength && state[key].length < field.minLength ||
				field.required && state[key].length < 1) {
				if (field.length < 1) state.fieldErrors[key] = `${field.title} is required`;
				else state.fieldErrors[key] = `${field.title} is too short`;
			}
		})
	},

	/**
	 * @memberof app/tools/Validation
	 * @param {object} fields Object of field configurations
	 * @param {object} state Form state containing field values
	 */
	validateConfirmPasswordMatches: function (fields, state) {
		if (state.password && state.confirmPassword) {
			if (state.password !== state.confirmPassword) {
				state.fieldErrors.confirmPassword = 'Password does not match';
			}
		}
	},

	/**
	 * @memberof app/tools/Validation
	 * @param {object} fields Object of field configurations
	 * @param {object} state Form state containing field values
	 */
	validateEmails: function (fields, state) {
		Object.entries(fields).forEach(([key, field]) => {
			if (field.type === 'email') {
				if (!emailRegex.test(state[key])) {
					state.fieldErrors[key] = 'Email address is not valid';
				}
			}
		})
	},

};

export default Validation;
