/** @namespace views/CategoriesView */

import React from 'react'
import View from '../components/View';
import Authentication from '../tools/Authentication'
import Requests from '../tools/Requests'
import Category from '../components/Category';

export default class CategoriesView extends View {
	constructor(props){
		super(props)
		this.page = this.page.bind(this)
		this.update = this.update.bind(this)
	}

	componentDidMount() {
		this._isMounted = true
		if (Authentication.getToken()) this.page()
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	state = {
		categories: [],
		loading: false,
		error: null,
	}

	page() {
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

	update(category, noSearch) {
		const { categories } = this.state

		// Mark category as moved (for paging)
		category.moved = true

		// Find index of relevant transaction
		let index;
		if (!noSearch) for (var i in categories) {
			if (categories[i].guid === category.guid) {
				index = i; break;
			}
		}

		// Add, remove or update category
		if (!index) categories.unshift(category);
		else if (category.erased) categories.splice(index, 1);
		else categories[index] = category

		// Sort transactions
		categories.sort((a, b) => b.name-a.name); // Needs be updated with table-aware sort function

		// Don't keep transaction if it's been moved to the very bottom
		if (categories[categories.length - 1].moved) {
			categories.pop();
		}

		this.setState({ categories })
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
				{categories.map((category) => <Category key={category.guid} category={category} update={this.update} />)}
				{loading ? "Loading..." : null}
				{error ? `Error: ${error}` : null}
			</div>
		);
  	}
}