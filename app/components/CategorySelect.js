/** @namespace app/components/CategorySelect */
import React from 'react'
import Requests from '../tools/Requests'
import Autosuggest from 'react-autosuggest';

export default class CategorySelect extends React.Component {
	
	constructor(props) {
		super(props)
		this.onChange = this.onChange.bind(this)
		this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this)
		this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this)
	}

	componentDidMount() {
		this._isMounted = true
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	state = {
		empty: true,
		loading: false,
		error: null,
		active: false,
		categories: [],
	}

	getCategories() {
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

	onChange(event) {
		this.props.onChange(event)
	}

	onSuggestionsFetchRequested({ value }) {
		if (this.state.categories.length == 0) this.getCategories();
		console.log('onSuggestionsFetchRequested')
		console.log(value);
	}

	onSuggestionsClearRequested() {
		console.log('onSuggestionsClearRequested')
	}

	render() {
		const { categories } = this.state
		const { value } = this.props
		return (
			<Autosuggest
				inputProps={{value, onChange: this.onChange}}
				suggestions={categories}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}
				getSuggestionValue={suggestion => suggestion.name}
				renderSuggestion={suggestion => <div>{suggestion.name}</div>}
			/>
		);
	}	
}
