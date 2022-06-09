/** @namespace app/views/InsightsView */

import React from 'react'

import View from '../components/View';
import Insight from '../components/Insight';
import Requests from '../tools/Requests'

export default class InsightsView extends View {

	state = {
		loading: false,
		error: null,
		insights: [],
	}

	constructor(props){
		super(props)
	}

	componentDidMount() {
		this._isMounted = true
		this.get()
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	get() {
		this.setState({ loading: true })
		Requests.do('insight.list').then((response) => {
			if (this._isMounted) this.setState({ insights: response.insights, loading: false, error: null })
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
	}

	render() {

		const { loading, insights } = this.state

		let insightElements = []
		for (let insight of insights) {
			insightElements.push(<Insight key={insight.guid} metadata={insight} />)
		}

		return (
			<div className="view">
				<div className="heading">
					<h1>{"Insights"}</h1>
				</div>
				{loading && "Loading..."}
				{insightElements}
			</div>
		);
  	}
}