/** @namespace app/views/TransactionView */

import React from 'react'
import Moment from 'moment'
import Numeral from 'numeral'

import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import View from '../components/View'
import Transaction from '../components/Transaction'
import TransactionFilter from '../components/TransactionFilter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TRANSACTIONS_PAGE_SIZE } from './../tools/Constants'

let scrollForwarder

export default class TransactionsView extends View {

	constructor(props){
		super(props)
		this.page = this.page.bind(this)
		this.sum = this.sum.bind(this)
		this.update = this.update.bind(this)
		this.createTransaction = this.createTransaction.bind(this)
		this.handleFilter = this.handleFilter.bind(this)
	}

	filter = {}

	state = {
		transactions: [],
		loading: false,
		error: null,
		exhausted: false,

		sum: 0,
		sumLoading: false,
		sumError: null,
	}

	componentDidMount() {
		this._isMounted = true
		if (Authentication.getToken()) this.reload()
		scrollForwarder = e => this.handleScroll(e)
		window.addEventListener("scroll", scrollForwarder);
	}

	componentWillUnmount() {
		this._isMounted = false
		window.removeEventListener("scroll", scrollForwarder);
	}

	reload = () => {
		this.setState({ transactions: [] }, () => {
			this.page();
			this.sum();
		})
	}

	handleFilter(filter) {
		this.filter = filter
		this.reload()
	}

	handleScroll = () => { 
		const { loading, exhausted } = this.state
		const lastItem = document.querySelector(".view li.transaction:last-of-type")
		if (!lastItem) return
		const lastItemOffset = lastItem.offsetTop + lastItem.clientHeight
		const pageOffset = window.pageYOffset + window.innerHeight
		if (pageOffset > lastItemOffset) {
			if (!loading && !exhausted) this.page()
		}
	};

	createTransaction() {
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

		let query = this.filter;
		query.pageSize = TRANSACTIONS_PAGE_SIZE
		query.pageFrom = lastTransaction ? lastTransaction.date : undefined

		Requests.do('transaction.list', query).then((response) => {
			let exhausted = false;
			if (response.transactions) {
				if (response.transactions.length < TRANSACTIONS_PAGE_SIZE) exhausted = true;
				response.transactions.forEach((transaction) => transactions.push(transaction))
			}
			if (this._isMounted) this.setState({
				transactions, 
				exhausted, 
				loading: false,
				error: null
			})
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
	}

	sum() {
		this.setState({ sumLoading: true })
		Requests.do('transaction.sum', this.filter).then((response) => {
			if (this._isMounted) this.setState({
				sum: response.sum,
				sumLoading: false,
				sumError: null
			})
		}).catch((response) => {
			if (this._isMounted) this.setState({ sumLoading: false, sumError: response.message })
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

		// Don't keep transaction if it's been moved to the very bottom and we have a full page
		if (transaction.length >= TRANSACTIONS_PAGE_SIZE && transactions[transactions.length - 1].moved) {
			transactions.pop();
		}

		this.setState({ transactions })
		if (transaction.amount) this.sum()
	}
	
	render() {
		const {
			loading, error, exhausted, transactions,
			sum, sumLoading, sumError,
		} = this.state;
		return (
			<div className="view">
				<div className="heading">
					<FontAwesomeIcon icon="plus-circle" className="button" onClick={this.createTransaction} />
					<h1>{"Transactions"}</h1>
					<p>
						{"Total: "}
						{sumLoading
							? "Loading..."
							: sumError
								? sumError
								: `${Numeral(sum).format('$0,0.00')}`}
					</p>
				</div>
				<TransactionFilter propagate={this.handleFilter} />
				<div className="row heading_row columns transaction-row">
					<div className="column date">Date</div>
					<div className="column desc">Note</div>
					<div className="column category">Category</div>
					<div className="column amount right">Amount</div>
					<div className="column check"></div>
				</div>
				{transactions.map((transaction) => 
					<Transaction transaction={transaction} key={transaction.guid} update={this.update} />)}
				{loading
					? "Loading..." 
					: exhausted
						? "No more items"
						: <div onClick={this.page}>{"Load more"}</div> }
				{error ? `Error: ${error}` : null}
			</div>
		);
	}  
}