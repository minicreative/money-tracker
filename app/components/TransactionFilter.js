/** @namespace app/components/TransactionFilter */
import React from 'react'
import { QUERY_TIMER } from '../tools/Constants'
import CategorySelect from './CategorySelect'
import DateRangeSelect from './DateRangeSelect'

export default class TransactionFilter extends React.Component {

	constructor(props) {
        super(props)
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
        this.handleCategoryChange = this.handleCategoryChange.bind(this)
        this.handleDateRangeChange = this.handleDateRangeChange.bind(this)
        this.reset = this.reset.bind(this)
	}

	state = {
        filter: {
            description: '',
        },
	}

	componentDidMount() {
		this._isMounted = true
	}

	componentWillUnmount() {
		this._isMounted = false
    }
    
    handleDescriptionChange(event) {
        this.lastEdited = Date.now()
		const { filter } = this.state
		filter.description = event.target.value
		if (this._isMounted) this.setState({ filter })

		// Setup timer for updates
		setTimeout(() => {
            console.log(Date.now()-this.lastEdited)
			if (Date.now()-this.lastEdited > QUERY_TIMER) this.props.propagate(filter)
		}, QUERY_TIMER+10)
    }

    handleCategoryChange(categories) {
        const { filter } = this.state
        filter.categories = categories
        this.props.propagate(filter)
    }

    handleDateRangeChange(range) {
        const { filter } = this.state
        if (!range) range = {}
        filter.startDate = range.startDate
        filter.endDate = range.endDate
        this.props.propagate(filter)
    }

    reset() {
        this.setState({ resetAll: true, filter: {description: ''} }, () => {
            this.setState({ resetAll: null })
            this.props.propagate({})
        })
    }

	render() {
		const { filter, resetAll } = this.state
		return (
			<div className="transaction-filter">
                <div className="field">
                    <input name="query" type="text" value={filter.description} onChange={this.handleDescriptionChange} />
                </div>
                <div className="field">
                    {!resetAll && <CategorySelect propagate={this.handleCategoryChange} />}
                </div>
                <div className="field">
                    {!resetAll && <DateRangeSelect propagate={this.handleDateRangeChange} />}
                </div>
                <div className="field" onClick={this.reset}>{"Reset"}</div>
            </div>
        )
	}
}
