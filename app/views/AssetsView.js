/** @namespace app/views/AssetsView */

import React from 'react'
import View from '../components/View';
import Requests from '../tools/Requests'
import Numeral from 'numeral'

export default class AssetsView extends View {

	constructor(props){
		super(props)
	}

	state = {
		totals: {},
		accounts: [],
		holdings: [],
	}

	componentDidMount() {
		this.getAssets()
	}

	getAssets() {
		this.setState({ status: "Loading..." })
		Requests.do("user.accounts")
			.then(response => {
				let accountsTotal = 0
				for (var account of response.accounts) accountsTotal += account.balances.available
				let holdingsTotal = 0
				for (var holding of response.holdings) holdingsTotal += holding.value
				let grandTotal = accountsTotal + holdingsTotal
				this.setState({
					status: null,
					totals: {
						accountsTotal,
						holdingsTotal,
						grandTotal,
					},
					accounts: response.accounts,
					holdings: response.holdings,
				})
			})
			.catch(err => {
				this.setState({
					status: err.message,
				})
			})
	}

	render() {
		const { status, accounts, holdings, totals } = this.state
		return (
			<div className="view">
				<div className="heading">
					<h1>{"Assets"}</h1><br />
					{status && <div className="status">{status}</div>}
					<h2>{"Bank Accounts"}</h2>
					{accounts.map(account => {
						return <div className="account" key={account.account_id}>
							{`${account.name} (${account.mask})`}<br />
							<b>{Numeral(account.balances.available).format('$0,0.00')}</b>
						</div>
					})}
					{totals && totals.accountsTotal && 
						`Total: ${Numeral(totals.accountsTotal).format('$0,0.00')}`}
					<br/><br/>
					<h2>{"Holdings"}</h2>
					{holdings.map(holding => {
						return <div className="account" key={holding.symbol}>
							{`${holding.symbol} (${holding.amount} @ ${holding.price}USD)`}<br />
							<b>{Numeral(holding.value).format('$0,0.00')}</b>
						</div>
					})}
					{totals && totals.holdingsTotal && 
						`Total: ${Numeral(totals.holdingsTotal).format('$0,0.00')}`}
					<br/><br/>
					{totals && totals.grandTotal && 
						<h2>{`Grand Total: ${Numeral(totals.grandTotal).format('$0,0.00')}`}</h2>}
				</div>
			</div>
		);
  	}
}