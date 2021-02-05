/** @namespace app/components/CategorySelect */
import { faThList } from '@fortawesome/free-solid-svg-icons';
import React from 'react'
import Requests from '../tools/Requests'

var sortCategories = function(a, b) {
	if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
}

export default class CategorySelect extends React.Component {
	
	constructor(props) {
		super(props)

		this.wrapperRef = React.createRef()
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.handleClick = this.handleClick.bind(this)

		this.propagate = this.propagate.bind(this)
		this.handleCategorySelect = this.handleCategorySelect.bind(this)
		this.selectAll = this.selectAll.bind(this)
	}

	componentDidMount() {
		this._isMounted = true
		document.addEventListener('mousedown', this.handleClickOutside)
		this.getCategories()
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside)
		this._isMounted = false
	}

	state = {
		open: false,
		loading: false,
		error: null,
		selected: {},
		categoryCount: 0,
		numSelected: 0,
		expenseCategories: [],
		incomeCategories: [],
	}

	propagate() {
		if (!this.changed) return
		let { numSelected, categoryCount, selected } = this.state
		if (numSelected === categoryCount || numSelected === 0 )
			return this.props.propagate()
		let categories = []
		for (let key in selected) 
			if (selected.hasOwnProperty(key) && selected[key]) 
				categories.push(key)
		
		this.props.propagate(categories)
		this.changed = false
	}

	handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
			if (this.state.open) this.propagate()
			this.setState({ open: false })
		}	
	}
	
	handleClick() {
		if (this.state.open) this.propagate()
		this.setState({ open: !this.state.open })
	}

	getCategories() {
		this.setState({ loading: true })
		Requests.do('category.list').then((response) => {
			let { categories } = response;

			let parents = {}
			let selected = {}
			for (let category of categories) {

				// Add category to selected as unselected
				selected[category.guid] = false

				// Add parents to parents
				if (!category.parent) {
					category.children = []
					parents[category.guid] = category
				}
			}

			// Add children to parents
			for (let category of categories) {
				if (category.parent) {
					parents[category.parent].children.push(category)
				}
			}
			
			// Push parents into arrays, sort
			let incomeCategories = []
			let expenseCategories = []
			for (let key in parents) {
				if (parents.hasOwnProperty(key)) {
					parents[key].children.sort(sortCategories)
					if (parents[key].income) incomeCategories.push(parents[key])
					else expenseCategories.push(parents[key])
				}
			}
			incomeCategories.sort(sortCategories)
			expenseCategories.sort(sortCategories)

			if (this._isMounted) this.setState({ 
				selected,
				incomeCategories,
				expenseCategories,
				categoryCount: categories.length,
				numSelected: 0,
				loading: false,
				error: null
			})
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
	}

	renderCategory(category) {
		return <li key={category.guid} className={category.parent ? 'child' : null}>
			<input type="checkbox" checked={this.state.selected[category.guid]} onChange={this.handleCategorySelect(category.guid)} />
			{category.name}
		</li>
	}

	renderParentCategory(category) {
		let output = []
		output.push(this.renderCategory(category))
		if (category.children) for (let child of category.children) {
			output.push(this.renderCategory(child))
		}
		return output
	}

	handleCategorySelect = (guid) => () => {
		let { selected, numSelected } = this.state;
		selected[guid] = !selected[guid]

		this.changed = true
		this.setState({
			selected,
			numSelected: selected[guid] ? numSelected + 1 : numSelected - 1,
		})
	}

	selectAll = (select) => () => {
		let { selected } = this.state
		for (let key in selected) 
			if (selected.hasOwnProperty(key)) 
				selected[key] = select

		this.changed = true
		this.setState({ 
			selected,
			numSelected: select ? this.state.categoryCount : 0,
		})
	}

	getSummary() {
		let { categoryCount, numSelected } = this.state
		if (numSelected === categoryCount || numSelected === 0) return "All categories"
		return numSelected + " categories"
	}

	render() {
		const { incomeCategories, expenseCategories, loading, open } = this.state

		let className = "select category-select"
		if (open) className += " open"

		return (
			<div className={className} ref={this.wrapperRef}>
				<div className="select-summary" onClick={this.handleClick}>{this.getSummary()}</div>
				<div className="dropdown">
					{loading && "Loading categories..."}
					<div onClick={this.selectAll(true)}>{"Select all"}</div>
					<div onClick={this.selectAll(false)}>{"Select none"}</div>
					<div className="select-header">{"Expenses"}</div>
					{expenseCategories.map(category => {
						return this.renderParentCategory(category)
					})}
					<div className="select-header">{"Income"}</div>
					{incomeCategories.map(category => {
						return this.renderParentCategory(category)
					})}
				</div>
			</div>
		);
	}	
}
