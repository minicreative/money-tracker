/** @namespace views/TransactionView */

import React from 'react'

import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import View from '../components/View'
import Transaction from '../components/Transaction'
import Moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TRANSACTIONS_PAGE_SIZE } from './../tools/Constants'

let scrollForwarder

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
		error: null,
		exhausted: false,
	}

	componentDidMount() {
		this._isMounted = true
		if (Authentication.getToken()) this.page()
		scrollForwarder = e => this.handleScroll(e)
		window.addEventListener("scroll", scrollForwarder);
	}

	componentWillUnmount() {
		this._isMounted = false
		window.removeEventListener("scroll", scrollForwarder);
	}

	reload = () => {
		this.setState({ transactions: [] }, this.page)
	}

	handleScroll = () => { 
		const { loading, exhausted } = this.state
		const lastItem = document.querySelector(".view li:last-of-type");
		const lastItemOffset = lastItem.offsetTop + lastItem.clientHeight;
		const pageOffset = window.pageYOffset + window.innerHeight;
		if (pageOffset > lastItemOffset) {
			if (!loading && !exhausted) this.page();
		}
	};

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

		// Get true last transaction
		let lastTransaction
		if (transactions.length) {
			lastTransaction = transactions[transactions.length - 1]
		}

		this.setState({ loading: true })
		Requests.do('transaction.list', { 
			pageSize: TRANSACTIONS_PAGE_SIZE, 
			pageFrom: lastTransaction ? lastTransaction.date : undefined,
		}).then((response) => {
			let exhausted = false;
			if (response.transactions) {
				if (response.transactions.length < TRANSACTIONS_PAGE_SIZE) exhausted = true;
				response.transactions.forEach((transaction) => transactions.push(transaction))
			}
			if (this._isMounted) this.setState({ transactions, exhausted, loading: false, error: null })
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
	}

	update(transaction, noSearch) {
		const { transactions } = this.state

		// Mark transaction as moved (for paging)
		transaction.moved = true

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

		// Don't keep transaction if it's been moved to the very bottom
		if (transactions[transactions.length - 1].moved) {
			transactions.pop();
		}

		this.setState({ transactions })
	}
	
	render() {
		const { loading, error, exhausted, transactions } = this.state;
		return (
			<div className="view">
				<div className="heading">
					<FontAwesomeIcon icon="plus-circle" className="button" onClick={this.createTransaction} />
					<h1>{"Transactions"}</h1>
				</div>
				<div className="row heading_row columns transaction">
					<div className="column date">Date</div>
					<div className="column desc">Note</div>
					<div className="column category">Category</div>
					<div className="column amount right">Amount</div>
					<div className="column check"></div>
				</div>
				{transactions.map((transaction) => 
					<Transaction transaction={transaction} key={transaction.guid} update={this.update} />)}
				{ loading
					? "Loading..." 
					: exhausted
						? "No more items"
						: <div onClick={this.page}>{"Load more"}</div> }
				{error ? `Error: ${error}` : null}
			</div>
		);
	}  
}