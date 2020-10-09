/** @namespace app/views/InsightsView */

import React from 'react'
import View from '../components/View';
import CategoryInsights from '../components/CategoryInsights'

export default class InsightsView extends View {
	constructor(props){
		super(props)
	}

	render() {
		return (
			<div className="view">
				<div className="heading">
					<h1>{"Insights"}</h1>
				</div>
				<CategoryInsights />
			</div>
		);
  	}
}