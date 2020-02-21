/** @namespace components/Category */
import React from 'react'
import Numeral from 'numeral'
import Moment from 'moment'

export default class Category extends React.Component {

	render() {
		const { data } = this.props
		const monthArray = Object.entries(data.monthly).sort((a, b) => parseInt(b[0])-parseInt(a[0]))
		const fullArray = Object.entries(data.full).sort((a, b) => a[1]-b[1])
		return (<div className="insight">
			<div className="insight-heading"><h2>{"Spending by Category"}</h2></div>
			<div className="insight-table">
				<table cellspacing="0">
					<thead>
						<tr>
							<th>{"Category"}</th>
							<th>{"All Time"}</th>
							{monthArray.map(([key]) => 
								<th key={key}>{Moment(parseInt(key)*1000).format('MMM YYYY')}</th>)}
						</tr>
					</thead>
					<tbody>
						{fullArray.map(([category]) => {
							if (data.categoryNames[category]) return (
								<tr className={category === 'total' ? "total" : null} key={category}>
									<td>{data.categoryNames[category]}</td>
									<td>{Numeral(data.full[category]).format('$0,0.00')}</td>
									{monthArray.map(([key]) => 
										<td key={key}>{
											data.monthly[key][category] != 0
												? Numeral(data.monthly[key][category]).format('$0,0.00')
												: null
										}</td>)}
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>)
	}
}
