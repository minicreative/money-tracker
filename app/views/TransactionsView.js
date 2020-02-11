/** @namespace views/TransactionView */

import React from 'react'

import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import View from '../components/View'
import Transaction from '../components/Transaction'
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
		this._isMounted = true
		if (Authentication.getToken()) this.page()
	}

	componentWillUnmount() {
		this._isMounted = false
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
			if (this._isMounted) this.setState({ loading: false, error: null })
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
	}

	page() {
		const { transactions } = this.state
		this.setState({ loading: true })
		Requests.do('transaction.list', { pageSize: 200 }).then((response) => {
			if (response.transactions) {
				response.transactions.forEach((transaction) => transactions.push(transaction))
			}
			if (this._isMounted) this.setState({ transactions, loading: false, error: null })
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
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
				<div class="heading">
					<div className="button" onClick={this.createTransaction}>{"New transaction"}</div>
					<h1>{"Transactions"}</h1>
				</div>
				{transactions.map((transaction) => 
					<Transaction transaction={transaction} key={transaction.guid} update={this.update} />)}
				{loading ? "Loading..." : null}
				{error ? `Error: ${error}` : null}
			</div>
		);
	}  
}