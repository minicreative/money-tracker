/** @namespace components/Transaction */
import React from 'react'
import Moment from 'moment'
import Numeral from 'numeral'
import Requests from '../tools/Requests'
import { EDIT_TIMER } from '../tools/Constants'

function getFieldStateForTransaction (transaction) {
	return {
		date: transaction.date ? Moment(transaction.date*1000).format('MMMM D, YYYY') : '',
		description: transaction.description ? transaction.description : '',
		category: transaction.categoryName ? transaction.categoryName : '',
		amount: transaction.amount ? Numeral(transaction.amount).format('$0,0.00') : '',
	}
}

export default class Transaction extends React.Component {

	constructor(props) {
		super(props)
		this.update = this.update.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	state = {
		edited: false,
		loading: false,
		errors: {},
		fields: {
			date: '',
			description: '',
			category: '',
			amount: '',
		},
	}

	componentDidMount() {
		this.setState({ fields: getFieldStateForTransaction(this.props.transaction) })
	}

	handleChange(event) {
		this.lastEdited = Date.now()
		const { fields } = this.state
		fields[event.target.name] = event.target.value
		this.setState({ fields, edited: true })

		// Setup timer for updates
		setTimeout(() => {
			if (Date.now()-this.lastEdited > EDIT_TIMER) this.update()
		}, EDIT_TIMER)
	}

	update() {
		const { fields } = this.state
		const errors = {}
		const request = {
			guid: this.props.transaction.guid,
			description: fields.description,
			categoryName: fields.category,
		}

		// Validate amount
		if (fields.amount.match(/[^.,$+-\d]/g)) {
			errors.amount = true
		} else {
			let formattedAmountString = fields.amount.replace(/[$,]/g, '')
			if (isNaN(formattedAmountString)) {
				errors.amount = true
			} else {
				request.amount = Number(Numeral(formattedAmountString).format('0[.]00'))
			}
		}

		// Validate date
		let date = Date.parse(fields.date)
		if (isNaN(date)) {
			errors.date = true
		} else {
			request.date = date/1000;
		}

		if (errors.amount || errors.date) return this.setState({ errors })

		this.setState({ edited: false, loading: true, errors: {} })
		Requests.do('transaction.edit', request).then((response) => {
			this.setState({ loading: false, fields: getFieldStateForTransaction(response.transaction) })
		})
	}

	// Might need to render just the text, and then input on click
	render() {
		const { edited, loading, fields, errors } = this.state
		return (
			<div className="row transaction">
				<div className="column check">
					{loading ? "..." : edited ? "e" : "x"}
				</div>
				<div className={`column date ${errors.date ? 'error' : ''}`}>
					<input name="date" type="text" value={fields.date} onChange={this.handleChange} />
				</div>
				<div className={`column desc ${errors.description ? 'error' : ''}`}>
					<input name="description" type="text" value={fields.description} onChange={this.handleChange} />
				</div>
				<div className={`column category ${errors.category ? 'error' : ''}`}>
					<input name="category" type="text" value={fields.category} onChange={this.handleChange} />
				</div>
				<div className={`column amount ${errors.amount ? 'error' : ''}`}>
					<input name="amount" type="text" value={fields.amount} onChange={this.handleChange} />
				</div>
				<div className="clear"></div>
			</div>
		)
	}
}
