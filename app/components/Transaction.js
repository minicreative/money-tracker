/** @namespace components/Transaction */
import React from 'react'
import Moment from 'moment'
import Numeral from 'numeral'
import Requests from '../tools/Requests'
import { EDIT_TIMER } from '../tools/Constants'

export default class Transaction extends React.Component {

	constructor(props) {
		super(props)
		this.update = this.update.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	state = {
		edited: false,
		loading: false,
		transaction: {
			date: 0,
			description: '',
			categoryName: '',
			amount: 0,
		},
	}

	componentDidMount() {
		this.setState({ transaction: this.props.transaction })
	}

	handleChange(event) {
		this.lastEdited = Date.now()
		const { transaction } = this.state
		const { name, value } = event.target

		// Handle change based on field name
		if (name === "description") {
			transaction.description = value
		}

		// Update state
		this.setState({ transaction, edited: true })

		// Setup timer for updates
		setTimeout(() => {
			if (Date.now()-this.lastEdited > EDIT_TIMER) this.update()
		}, EDIT_TIMER)
	}

	update() {
		const { transaction } = this.state
		const { guid, description } = transaction
		this.setState({ edited: false, loading: true })
		Requests.do('transaction.edit', { guid, description }).then((response) => {
			if (!this.state.edited) this.setState({ loading: false, transaction: response.transaction })
		})
	}

	render() {
		const { edited, loading, transaction } = this.state
		return (
			<div className="row transaction">
				<div className="column check">
					{loading ? "..." : edited ? "e" : "x"}
				</div>
				<div className="column date">
					{Moment(transaction.date*1000).format('MMMM D, YYYY')}
				</div>
				<div className="column desc">
					<input name="description" type="text" value={transaction.description} onChange={this.handleChange} />
				</div>
				<div className="column category">
					{transaction.categoryName}
				</div>
				<div className="column amount">
					{Numeral(transaction.amount).format('$0,0.00')}
				</div>
				<div className="clear"></div>
			</div>
		)
	}
}
