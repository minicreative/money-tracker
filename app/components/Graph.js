/** @namespace app/components/Graph */
import React from 'react'
import ChartJS from 'chart.js'
import Moment from 'moment'
import Numeral from 'numeral'

import Requests from './../tools/Requests'

let chart;
export default class Category extends React.Component {

	constructor(props) {
        super(props)
        this.handleExcludeGifts = this.handleExcludeGifts.bind(this);
		this.handleExcludeHousing = this.handleExcludeHousing.bind(this);
        this.handleExcludeProperty = this.handleExcludeProperty.bind(this);
        this.handleExcludeInvestment = this.handleExcludeInvestment.bind(this);
	}

	state = {
        loading: false,
        excludeGifts: true,
        excludeHousing: false,
        excludeProperty: true,
        excludeInvestment: true,
	}

	componentDidMount() {
        this.get()
    }
    
    get() {
        const { excludeGifts, excludeHousing, excludeProperty, excludeInvestment } = this.state
		this.setState({ loading: true })
		Requests.do('insights.totals', {
			excludeGifts, excludeHousing, excludeProperty, excludeInvestment
		}).then((response) => {
            this.setState({ loading: false });
            this.build(response.data)
		})
    }

    build(data) {
        let formattedTimestamps = [];
        for (let i in data.timestamps) {
            formattedTimestamps[i] = Moment(data.timestamps[i], 'X').utc().format('MMM YYYY')
        }

        if (chart !== undefined) chart.destroy()
        chart = new ChartJS(this.props.id, {
            type: "bar",
            data: {
                labels: formattedTimestamps,
                datasets: [
                    {
                        label: "Expenses",
                        data: data.totals,
                    }
                ],
            },
            options: {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display:false
                        }
                    }],
                },
                tooltips: {
                    callbacks: {
                        label: (item) => Numeral(item.yLabel).format('$0,0.00'),
                    }
                }
            }
        })
    }


	handleExcludeGifts(event) {
		this.setState({ excludeGifts: event.target.checked }, this.get)
	}

	handleExcludeHousing(event) {
		this.setState({ excludeHousing: event.target.checked }, this.get)
	}

    handleExcludeProperty(event) {
		this.setState({ excludeProperty: event.target.checked }, this.get)
	}

    handleExcludeInvestment(event) {
		this.setState({ excludeInvestment: event.target.checked }, this.get)
	}

	render() {
        const { id } = this.props;
        const { loading, excludeGifts, excludeHousing, excludeProperty, excludeInvestment } = this.state;

		return (<div className="insight">
			<div className="insight-heading">
				<h2>{"Spending over time"}</h2>
                <input type="checkbox" checked={excludeGifts} onChange={this.handleExcludeGifts} />{"Exclude gifts"}
				<input type="checkbox" checked={excludeHousing} onChange={this.handleExcludeHousing} />{"Exclude housing"}
                <input type="checkbox" checked={excludeProperty} onChange={this.handleExcludeProperty} />{"Exclude property"}
                <input type="checkbox" checked={excludeInvestment} onChange={this.handleExcludeInvestment} />{"Exclude investment"}
			</div>
			{loading && "Loading..."}
            <div className="insight-chart">
                <canvas id={id}></canvas>
            </div>
		</div>)
	}
}
