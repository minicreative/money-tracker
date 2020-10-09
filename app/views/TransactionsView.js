/** @namespace app/views/TransactionView */

import React from 'react'

import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import View from '../components/View'
import Transaction from '../components/Transaction'
import Moment from 'moment'
import Numeral from 'numeral'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TRANSACTIONS_PAGE_SIZE, QUERY_TIMER } from './../tools/Constants'

let scrollForwarder

export default class TransactionsView extends View {

	constructor(props){
		super(props)
		this.page = this.page.bind(this)
		this.sum = this.sum.bind(this)
		this.update = this.update.bind(this)
		this.createTransaction = this.createTransaction.bind(this)
		this.handleQueryChange = this.handleQueryChange.bind(this)
	}

	state = {
		transactions: [],
		loading: false,
		error: null,
		exhausted: false,

		sum: 0,
		sumLoading: false,
		sumError: null,

		query: {
			description: ''
		}
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
		const { transactions, query } = this.state

		// Get true last transaction
		let lastTransaction
		if (transactions.length) {
			lastTransaction = transactions[transactions.length - 1]
		}

		this.setState({ loading: true })
		Requests.do('transaction.list', { 
			pageSize: TRANSACTIONS_PAGE_SIZE, 
			pageFrom: lastTransaction ? lastTransaction.date : undefined,
			description: query.description,
		}).then((response) => {
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
		const { query } = this.state
		this.setState({ sumLoading: true })
		Requests.do('transaction.sum', {
			description: query.description
		}).then((response) => {
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

		// Don't keep transaction if it's been moved to the very bottom
		if (transactions[transactions.length - 1].moved) {
			transactions.pop();
		}

		this.setState({ transactions })
	}

	handleQueryChange(event) {
		this.lastQueryChange = Date.now()
		const { query } = this.state
		query[event.target.name] = event.target.value
		if (this._isMounted) this.setState({ query })

		setTimeout(() => {
			if (Date.now()-this.lastQueryChange > QUERY_TIMER) this.reload()
		}, QUERY_TIMER)
	}
	
	render() {
		const { loading, error, exhausted, transactions, query, sum, sumLoading, sumError } = this.state;
		return (
			<div className="view">
				<div className="heading">
					<FontAwesomeIcon icon="plus-circle" className="button" onClick={this.createTransaction} />
					<h1>{"Transactions"}</h1>
					<input type="text" name="description" value={query.description} onChange={this.handleQueryChange} />
					<p>
						{"Total: "}
						{sumLoading
							? "Loading..."
							: sumError
								? sumError
								: `${Numeral(sum).format('$0,0.00')}`}
					</p>
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