/** @namespace app/views/AccountsView */

import React from 'react'
import View from '../components/View';
import Requests from '../tools/Requests'
import Numeral from 'numeral'

export default class AccountsView extends View {

	constructor(props){
		super(props)
	}

	state = {
		accounts: [],
	}

	componentDidMount() {
		this.getAccounts()
	}

	getAccounts() {
		this.setState({ status: "Loading..." })
		Requests.do("user.accounts")
			.then(response => {
				this.setState({
					status: null,
					accounts: response.accounts,
				})
			})
			.catch(err => {
				this.setState({
					status: err.message,
				})
			})
	}

	render() {
		const { status, accounts } = this.state
		return (
			<div className="view">
				<div className="heading">
					<h1>{"Accounts"}</h1>
					{status && <div className="status">{status}</div>}
					{accounts.map(account => {
						return <div className="account" key={account.account_id}>
							{`${account.name} (${account.mask})`}<br />
							<b>{Numeral(account.balances.available).format('$0,0.00')}</b>
						</div>
					})}
				</div>
			</div>
		);
  	}
}