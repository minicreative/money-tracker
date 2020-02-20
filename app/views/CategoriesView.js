/** @namespace views/CategoriesView */

import React from 'react'
import View from '../components/View';

export default class CategoriesView extends View {
	constructor(props){
		super(props)
	}

	componentDidMount() {
		this._isMounted = true
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
		Requests.do('categories.list').then((response) => {
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
				{categories.map((category) => <div className="category row">{category.name}</div>)}
				{loading ? "Loading..." : null}
				{error ? `Error: ${error}` : null}
			</div>
		);
  	}
}