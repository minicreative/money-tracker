/** @namespace views/InsightsView */

import React from 'react'
import View from '../components/View';
import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import Numeral from 'numeral'

export default class InsightsView extends View {
	constructor(props){
		super(props)
	}

	state = {}

	componentDidMount() {
		this._isMounted = true
		if (Authentication.getToken()) this.get()
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	get() {
		Requests.do('insights.category').then((response) => {
			this.setState({ data: response.data });
		})
	}

	render() {
		const { data } = this.state
		console.log(data)
		return (
			<div className="view">
				<div className="heading">
					<h1>{"Insights"}</h1>
				</div>
				{data && <div className="category-spending">
					<table>
						<thead>
							<tr>
								<th>{"Name"}</th>
								<th>{"All Time"}</th>
								{Object.entries(data.monthly).map(([key, value]) => {
									return <th key={key}>{key}</th>
								})}
							</tr>
						</thead>
						<tbody>
							{Object.entries(data.categoryNames).map(([category, name]) => {
								return (<tr key={category}>
									<td>{name}</td>
									<td>{Numeral(data.full[category]).format('$0,0.00')}</td>
									{Object.entries(data.monthly).map(([key, value]) => {
										return <td key={key}>{Numeral(data.monthly[key][category]).format('$0,0.00')}</td>
									})}
								</tr>)
							})}
						</tbody>
					</table>
				</div>}
			</div>
		);
  	}
}