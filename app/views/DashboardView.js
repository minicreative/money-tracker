// Import dependencies
import React from 'react';

import Requests from '../tools/Requests'
import View from '../components/View';
import { NO_AUTH_LANDING } from '../tools/Constants';
import Authentication from '../tools/Authentication';

export default class DashboardView extends View {

	constructor(props){
		super(props)
		this.fileInput = React.createRef()
	}

	state = {
		transactions: [],
	}

	componentDidMount() {
		let self = this;
		Requests.do('transaction.list').then((response) => {
			if (response.transactions)
				self.setState({ transactions: response.transactions })
		}).catch((response) => {
			self.setState({ error: response.message })
		})
	}

	upload = (event) => {
		event.preventDefault()
		const file = this.fileInput.current.files[0]
		const reader = new FileReader()
		reader.onload = event => {
			let text = event.target.result
			Requests.do('transaction.import', {
				csv: text
			}).then(response => {
				console.log('Import complete')
			})
		}
		reader.readAsText(file)
	}

	logout = () => {
		Authentication.logout()
		this.props.history.push(NO_AUTH_LANDING)
	}
	
	render() {
		const { error, transactions } = this.state;
		return (
			<div className="view">
				<h1>{"Dashboard"}</h1>
				{error 
					? `Error: ${error}`
					: null}
				{transactions
					? transactions.map((item, index) => {
						return <div key={index}>{`${item.description} : $${item.amount}`}</div>
					})
					: null}
				<form onSubmit={this.upload}>
					<input type="file" ref={this.fileInput}></input>
					<input type="submit"></input>
				</form>
				<div onClick={this.logout}>Logout</div>
			</div>
		);
	}  
}