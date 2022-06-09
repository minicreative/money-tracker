/** @namespace app/views/InsightsView */

import React from 'react'

import View from '../components/View';
import Insight from '../components/Insight';

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
				<Insight metadata={{ type: "category-table" }} />
			</div>
		);
  	}
}