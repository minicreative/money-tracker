/** @namespace views/TransactionView */

import React from 'react'

import Requests from '../tools/Requests'
import View from '../components/View'
import Transaction from '../components/Transaction'
import Import from '../components/Import'

export default class TransactionsView extends View {

	constructor(props){
		super(props)
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

	page() {
		const self = this;
		const { transactions } = this.state
		self.setState({ loading: true })
		Requests.do('transaction.list', { pageSize: 200 }).then((response) => {
			if (response.transactions) {
				response.transactions.forEach((transaction) => transactions.push(transaction))
			}
			self.setState({ transactions, loading: false, error: null })
		}).catch((response) => {
			self.setState({ loading: false, error: response.message })
		})
	}
	
	render() {
		const { loading, error, transactions } = this.state;
		return (
			<div className="view">
				<h1>{"Transactions"}</h1>
				<Import onSuccess={this.reload} />
				{loading ? "Loading..." : null}
				{error ? `Error: ${error}` : null}
				{transactions.map((transaction, index) => <Transaction transaction={transaction} key={index} />)}
			</div>
		);
	}  
}