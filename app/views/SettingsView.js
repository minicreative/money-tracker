/** @namespace app/views/SettingsView */

import React from 'react'
import View from '../components/View';
import { PlaidLink } from 'react-plaid-link';
import Requests from '../tools/Requests'
import Form from '../components/Form';

export default class SettingsView extends View {

	constructor(props){
		super(props)
		this.plaidSuccess = this.plaidSuccess.bind(this)
	}

	state = {
		plaidToken: "",
	}

	componentDidMount() {
		this.plaidSetup()
	}

	plaidSetup() {
		Requests.do("user.plaidLinkToken")
			.then(response => {
				this.setState({
					plaidToken: response.plaidToken,
				})
			})
			.catch(err => {})
	}

	plaidSuccess(token) {
		Requests.do("user.savePlaidToken", { 
			plaidToken: token 
		})
	}

	render() {
		const { plaidToken } = this.state
		return (
			<div className="conatiner">
				{"Settings"}
				<PlaidLink token={plaidToken} onSuccess={this.plaidSuccess}>
					{"Setup a bank account"}
				</PlaidLink>
				<h2>{"Binance API"}</h2>
				<Form
					history={this.props.history}
					endpoint={'user.saveBinanceKeys'}
					fields={{
						binanceKey: { type: 'text', title: 'API Key' },
						binanceSecret: { type: 'text', title: 'Secret Key'}
					}}
				/>
			</div>
		);
  	}
}