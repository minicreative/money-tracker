/** @namespace views/CategoriesView */

import React from 'react'
import View from '../components/View';
import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import Category from '../components/Category';

export default class CategoriesView extends View {
	constructor(props){
		super(props)
	}

	componentDidMount() {
		this._isMounted = true
		if (Authentication.getToken()) this.get()
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	state = {
		categories: [],
		loading: false,
		error: null,
	}

	get() {
		const { categories } = this.state
		this.setState({ loading: true })
		Requests.do('category.list').then((response) => {
			if (response.categories) {
				response.categories.forEach((category) => categories.push(category))
			}
			if (this._isMounted) this.setState({ categories, loading: false, error: null })
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
	}

	render() {
		const { categories, loading, error } = this.state
		return (
			<div className="view">
				<div className="heading">
					<h1>{"Categories"}</h1>
				</div>
				<div className="row heading_row columns category">
					<div className="column name">Name</div>
					<div className="column parent">Parent Category</div>
					<div className="column check"></div>
				</div>
				{categories.map((category) => <Category key={category.guid} category={category} />)}
				{loading ? "Loading..." : null}
				{error ? `Error: ${error}` : null}
			</div>
		);
  	}
}