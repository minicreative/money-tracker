/** @namespace views/InsightsView */

import React from 'react'
import View from '../components/View';

export default class InsightsView extends View {
	constructor(props){
		super(props)
	}
	render() {
		return (
			<div className="view">
				{"Insights"}
			</div>
		);
  	}
}