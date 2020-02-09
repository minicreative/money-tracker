/** @namespace views/TransactionView */

import React from 'react'

import Requests from '../tools/Requests'
import View from '../components/View'
import Transaction from '../components/Transaction'
import Import from '../components/Import'
import Moment from 'moment'

export default class TransactionsView extends View {

	constructor(props){
		super(props)
		this.page = this.page.bind(this)
		this.update = this.update.bind(this)
		this.createTransaction = this.createTransaction.bind(this)
	}

	state = {
		transactions: [],
		loading: false,
		error: null
	}

	componentDidMount() {
		this.page();
	}

	reload = () => {
		this.setState({ transactions: [] }, this.page)
	}

	createTransaction() {
		const { transactions } = this.state;
		this.setState({ loading: true })
		Requests.do('transaction.create', {
			date: Number(Moment().format('X')),
		}).then((response) => {
			if (response.transaction) this.update(response.transaction, true)
			this.setState({ loading: false, error: null })
		}).catch((response) => {
			this.setState({ loading: false, error: response.message })
		})
	}

	page() {
		const { transactions } = this.state
		this.setState({ loading: true })
		Requests.do('transaction.list', { pageSize: 200 }).then((response) => {
			if (response.transactions) {
				response.transactions.forEach((transaction) => transactions.push(transaction))
			}
			this.setState({ transactions, loading: false, error: null })
		}).catch((response) => {
			this.setState({ loading: false, error: response.message })
		})
	}

	update(transaction, noSearch) {
		const { transactions } = this.state

		// Find index of relevant transaction
		let index;
		if (!noSearch) for (var i in transactions) {
			if (transactions[i].guid === transaction.guid) {
				index = i; break;
			}
		}

		// Add, remove or update transaction
		if (!index) transactions.unshift(transaction);
		else if (transaction.erased) transactions.splice(index, 1);
		else transactions[index] = transaction

		// Sort transactions
		transactions.sort((a, b) => b.date-a.date); // Needs be updated with table-aware sort function

		this.setState({ transactions })
	}
	
	render() {
		const { loading, error, transactions } = this.state;
		return (
			<div className="view">
				<h1>{"Transactions"}</h1>
				<div onClick={this.createTransaction}>{"New transaction"}</div>
				{transactions.map((transaction) => 
					<Transaction transaction={transaction} key={transaction.guid} update={this.update} />)}
				{loading ? "Loading..." : null}
				{error ? `Error: ${error}` : null}
				<Import onSuccess={this.reload} />
			</div>
		);
	}  
}