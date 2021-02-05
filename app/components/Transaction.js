/** @namespace app/components/Transaction */
import React from 'react'
import Moment from 'moment'
import Numeral from 'numeral'
import Requests from '../tools/Requests'
import CategorySelect from './CategorySelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
		this.delete = this.delete.bind(this)
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
		this._isMounted = true
		this.setState({ fields: getFieldStateForTransaction(this.props.transaction) })
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	handleChange(event) {
		this.lastEdited = Date.now()
		const { fields } = this.state
		fields[event.target.name] = event.target.value
		if (this._isMounted) this.setState({ fields, edited: true })

		// Setup timer for updates
		setTimeout(() => {
			if (Date.now()-this.lastEdited > EDIT_TIMER) this.update()
		}, EDIT_TIMER+10)
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

		if (errors.amount || errors.date && this._isMounted) return this.setState({ errors })

		if (this._isMounted) this.setState({ edited: false, loading: true, errors: {} })
		Requests.do('transaction.edit', request).then((response) => {
			if (response.transaction) {
				this.props.update(response.transaction)
				if (this._isMounted) this.setState({ loading: false, fields: getFieldStateForTransaction(response.transaction) })
			}
		})
	}

	delete() {
		if (this._isMounted) this.setState({ loading: true })
		Requests.do('transaction.delete', { guid: this.props.transaction.guid }).then((response) => {
			if (response.transaction) {
				this.props.update(response.transaction)
			}
		})
	}

	// Might need to render just the text, and then input on click
	render() {
		const { edited, loading, fields, errors } = this.state
		return (
			<li className="transaction row transaction-row">
				<div className={`column date ${errors.date ? 'error' : ''}`}>
					<input name="date" type="text" value={fields.date} onChange={this.handleChange} />
				</div>
				<div className={`column desc ${errors.description ? 'error' : ''}`}>
					<input name="description" type="text" value={fields.description} onChange={this.handleChange} />
				</div>
				<div className={`column category ${errors.category ? 'error' : ''}`}>
					{/* <CategorySelect name="category" value={fields.category} onChange={this.handleChange} /> */}
					<input name="category" type="text" value={fields.category} onChange={this.handleChange} />
				</div>
				<div className={`column amount right ${errors.amount ? 'error' : ''}`}>
					<input name="amount" type="text" value={fields.amount} onChange={this.handleChange} />
				</div>
				<div className="column check right">
					{loading ? "..." : edited ? "e" : "s"}
					<FontAwesomeIcon icon="trash" onClick={this.delete} />
				</div>
			</li>
		)
	}
}
