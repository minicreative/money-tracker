/** @namespace views/InsightsView */

import React from 'react'
import View from '../components/View';
import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import CategoryInsights from '../components/CategoryInsights'

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
			this.setState({ categoryData: response.data });
		})
	}

	render() {
		const { categoryData } = this.state
		return (
			<div className="view">
				<div className="heading">
					<h1>{"Insights"}</h1>
				</div>
				{categoryData ? <CategoryInsights data={categoryData} /> : null}
			</div>
		);
  	}
}