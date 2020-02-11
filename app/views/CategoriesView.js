/** @namespace views/CategoriesView */

import React from 'react'
import View from '../components/View';

export default class CategoriesView extends View {
	constructor(props){
		super(props)
	}
	render() {
		return (
			<div className="view">
				{"Categories"}
			</div>
		);
  	}
}