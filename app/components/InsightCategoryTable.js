/** @namespace app/components/InsightCategoryTable */
import React from 'react'
import Numeral from 'numeral'
import Moment from 'moment'

export default class InsightCategoryTable extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const { data } = this.props

		let monthArray, fullArray
		if (data) {
			monthArray = Object.entries(data.monthly).sort((a, b) => parseInt(b[0])-parseInt(a[0]))
			fullArray = Object.entries(data.full).sort((a, b) => a[1]-b[1])
		}

		return (<div className="insight">
			{data && <div className="insight-table">
				<table cellSpacing="0">
					<thead>
						<tr>
							<th>{"Category"}</th>
							<th>{"All Time"}</th>
							{monthArray.map(([key]) => 
								<th key={key}>{Moment(key, 'X').utc().format('MMM YYYY')}</th>)}
							<th>{"Avg. Month"}</th>
						</tr>
					</thead>
					<tbody>
						<tr key="total" className="total">
							<td>{"Total"}</td>
							<td>{Numeral(data.full.total).format('$0,0.00')}</td>
							{monthArray.map(([key]) => 
								<td key={key}>{
									data.monthly[key].total != 0
										? Numeral(data.monthly[key].total).format('$0,0.00')
										: null
								}</td>)}
							<td>{Numeral(data.monthAverage.total).format('$0,0.00')}</td>
						</tr>
						{fullArray.map(([category]) => {
							if (data.categoryNames[category]) return (
								<tr key={category}>
									<td>{data.categoryNames[category]}</td>
									<td>{Numeral(data.full[category]).format('$0,0.00')}</td>
									{monthArray.map(([key]) => 
										<td key={key}>{
											data.monthly[key][category] != 0
												? Numeral(data.monthly[key][category]).format('$0,0.00')
												: null
										}</td>)}
									<td>{Numeral(data.monthAverage[category]).format('$0,0.00')}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>}
		</div>)
	}
}
