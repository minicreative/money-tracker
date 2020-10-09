/** @namespace app/components/Category */
import React from 'react'
import Numeral from 'numeral'
import Moment from 'moment'
import Requests from './../tools/Requests'
import Authentication from './../tools/Authentication'

export default class Category extends React.Component {

	constructor(props) {
		super(props)
		this.handleExcludeGifts = this.handleExcludeGifts.bind(this);
		this.handleParentCategoriesOnly = this.handleParentCategoriesOnly.bind(this);
	}

	state = {
		loading: false,
		excludeGifts: false,
		parentCategoriesOnly: false,
	}

	componentDidMount() {
		if (Authentication.isAuthenticated()) this.get();
	}

	get() {
		const { excludeGifts, parentCategoriesOnly } = this.state
		this.setState({ loading: true })
		Requests.do('insights.category', {
			excludeGifts, parentCategoriesOnly,
		}).then((response) => {
			this.setState({ loading: false, data: response.data });
		})
	}

	handleExcludeGifts(event) {
		this.setState({ excludeGifts: event.target.checked }, this.get)
	}

	handleParentCategoriesOnly(event) {
		this.setState({ parentCategoriesOnly: event.target.checked }, this.get)
	}

	render() {
		const { data, loading, excludeGifts, parentCategoriesOnly } = this.state

		let monthArray, fullArray
		if (data) {
			monthArray = Object.entries(data.monthly).sort((a, b) => parseInt(b[0])-parseInt(a[0]))
			fullArray = Object.entries(data.full).sort((a, b) => a[1]-b[1])
		}

		return (<div className="insight">
			<div className="insight-heading">
				<h2>{"Spending by Category"}</h2>
				<input type="checkbox" checked={excludeGifts} onChange={this.handleExcludeGifts} />{"Exclude gifts"}
				<input type="checkbox" checked={parentCategoriesOnly} onChange={this.handleParentCategoriesOnly} />{"Group subcategories"}
			</div>
			{loading && "Loading..."}
			{data && <div className="insight-table">
				<table cellSpacing="0">
					<thead>
						<tr>
							<th>{"Category"}</th>
							<th>{"Avg. Month"}</th>
							{monthArray.map(([key]) => 
								<th key={key}>{Moment(parseInt(key)*1000).format('MMM YYYY')}</th>)}
							<th>{"All Time"}</th>
							<th>{"Avg. Day"}</th>
						</tr>
					</thead>
					<tbody>
						{fullArray.map(([category]) => {
							if (data.categoryNames[category]) return (
								<tr className={category === 'total' ? "total" : null} key={category}>
									<td>{data.categoryNames[category]}</td>
									<td>{Numeral(data.monthAverage[category]).format('$0,0.00')}</td>
									{monthArray.map(([key]) => 
										<td key={key}>{
											data.monthly[key][category] != 0
												? Numeral(data.monthly[key][category]).format('$0,0.00')
												: null
										}</td>)}
									<td>{Numeral(data.full[category]).format('$0,0.00')}</td>
									<td>{Numeral(data.dayAverage[category]).format('$0,0.00')}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>}
		</div>)
	}
}
