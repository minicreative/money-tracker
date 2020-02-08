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
			if (response.transaction) {
				transactions.unshift(response.transaction) // This causes weird effects, fix this
			}
			this.setState({ transactions, loading: false, error: null })
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
	
	render() {
		const { loading, error, transactions } = this.state;
		return (
			<div className="view">
				<h1>{"Transactions"}</h1>
				<div onClick={this.createTransaction}>{"New transaction"}</div>
				{loading ? "Loading..." : null}
				{error ? `Error: ${error}` : null}
				{transactions.map((transaction, index) => <Transaction transaction={transaction} key={index} />)}
				<Import onSuccess={this.reload} />
			</div>
		);
	}  
}