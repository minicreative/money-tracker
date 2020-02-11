/** @namespace views/SettingsView */

import React from 'react'
import View from '../components/View';

export default class SettingsView extends View {
	constructor(props){
		super(props)
	}
	render() {
		return (
			<div className="conatiner">
				{"Settings"}
			</div>
		);
  	}
}