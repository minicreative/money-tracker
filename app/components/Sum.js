/** @namespace app/components/Sum */
import React from 'react'
import Requests from '../tools/Requests'
import Numeral from 'numeral'
import _ from 'underscore'

export default class Category extends React.Component {

	constructor(props) {
		super(props)
	}

	state = {
        sum: 0,
        loading: false,
        error: null,
	}

	componentDidMount() {
        this._isMounted = true
        this.getSum()
	}

	componentWillUnmount() {
		this._isMounted = false
    }
    
    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.filter, prevProps.filter)) {
            this.getSum();
        }
    }

    getSum() {
		this.setState({ loading: true })
		Requests.do('transaction.sum', this.props.filter).then((response) => {
			if (this._isMounted) this.setState({
				sum: response.sum,
				loading: false,
				error: null
			})
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
    }

	render() {
		const { sum, loading, error } = this.state
		return (
            <span>
			{loading
                ? "Loading..."
                : error
                    ? error
                    : `${Numeral(sum).format('$0,0.00')}`}
            </span>
		)
	}
}
