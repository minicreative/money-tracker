/** @namespace app/components/Insight */
import React from 'react'
import Requests from '../tools/Requests'
import InsightCategoryTable from './InsightCategoryTable'
import TransactionFilter from './TransactionFilter'

export default class Insight extends React.Component {

    url = ""
    showParentCategories = false
    filter = {}

    state = {
        loading: false,
    }

	constructor(props) {
		super(props)
        this.handleFilter = this.handleFilter.bind(this)
	}

    componentDidMount() {
        const { metadata } = this.props

        // Setup filter from props
        // TODO: Refactor insight filter metadata
        if (metadata.description) this.filter.description = metadata.description
        if (metadata.categories) this.filter.categories = metadata.categories
        if (metadata.startDate) this.filter.startDate = metadata.startDate
        if (metadata.endDate) this.filter.endDate = metadata.endDate
        if (metadata.parentCategoriesOnly) this.filter.parentCategoriesOnly = metadata.parentCategoriesOnly

        // Setup settings from props
        if (metadata.type === "category-table") {
            this.url = "insight.category"
            this.showParentCategoriesToggle = true
        }

        // Get data on mount
        this.get()
    }

    handleFilter(filter) {
        this.filter = filter
        this.get()
    }

    get() {
		this.setState({ loading: true })
		Requests.do(this.url, this.filter).then((response) => {
            this.setState({ loading: false, data: response.data });
		})
    }

	render() {
		const { metadata } = this.props
        const { data, loading } = this.state

        let insight;
        if (metadata.type === "category-table")
            insight = <InsightCategoryTable data={data} />

        return (
            <div className="insight">
                {loading && "Loading..."}
                <TransactionFilter 
                    propagate={this.handleFilter} 
                    showParentCategoriesToggle={this.showParentCategoriesToggle}
                    initialFilter={metadata}
                />
                {insight}
            </div>
        )
	}
}
