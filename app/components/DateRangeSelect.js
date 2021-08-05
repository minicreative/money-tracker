/** @namespace app/components/DateSelect */
import React from 'react'
import Moment from 'moment'
import CalendarDateRangeSelect from './CalendarDateRangeSelect'

const rangePresets = [
    {
        name: "all",
        title: "All time",
    }, {
        name: "today",
        title: "Today",
        period: "day",
        subtract: 0,
    }, {
        name: "yesterday",
        title: "Yesterday",
        period: "day",
        subtract: 1,
    }, {
        name: "thisWeek",
        title: "This week",
        period: "week",
        subtract: 0,
    }, {
        name: "lastWeek",
        title: "Last week",
        period: "week",
        subtract: 1,
    }, {
        name: "thisMonth",
        title: "This month",
        period: "month",
        subtract: 0,
    }, {
        name: "lastMonth",
        title: "Last month",
        period: "month",
        subtract: 1,
    },
]

export default class DateRangeSelect extends React.Component {
	
	constructor(props) {
        super(props)
		this.wrapperRef = React.createRef()
		this.handleClickOutside = this.handleClickOutside.bind(this)
        this.handleClick = this.handleClick.bind(this)

        this.getPresetHandler = this.getPresetHandler.bind(this)
        this.handleCustomRangeClick = this.handleCustomRangeClick.bind(this)
        this.handleCustomRangeSelection = this.handleCustomRangeSelection.bind(this)
        this.getSummary = this.getSummary.bind(this)
	}

	componentDidMount() {
		this._isMounted = true
        document.addEventListener('mousedown', this.handleClickOutside)
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside)
		this._isMounted = false
	}

	state = {
        selectedPreset: rangePresets[0],
        selectedCustomRange: null,
		open: false,
		loading: false,
		error: null,
	}

	handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
			this.setState({ open: false })
		}	
    }
    
    handleClick() {
		this.setState({ open: !this.state.open })
    }

    getPresetHandler = (preset) => () => {
        if (preset.period) {
            let time = Moment()
            if (preset.subtract)
                time = time.subtract(preset.subtract, preset.period)
            this.props.propagate({
                startDate: time.utc().startOf(preset.period).format('X'),
                endDate: time.utc().endOf(preset.period).format('X')
            })
        } else {
            this.props.propagate()
        }
        this.setState({
            open: false,
            selectedPreset: preset,
            selectedCustomRange: null, 
        })
    }

    handleCustomRangeClick() {
        this.setState({
            selectedCustomRange: {},
        })
    }

    handleCustomRangeSelection(range) {
        this.setState({
            selectedPreset: null,
            selectedCustomRange: range
        })
        this.props.propagate({
            startDate: Moment(range.from).utc().startOf('day').format('X'),
            endDate: Moment(range.to).utc().endOf('day').format('X')
        })
    }
    
    getSummary() {
        const { selectedPreset, selectedCustomRange } = this.state
        if (selectedPreset)
            return selectedPreset.title
        else if (selectedCustomRange && selectedCustomRange.to && selectedCustomRange.from) {
            return Moment(selectedCustomRange.from).format('MM/DD/YY') + " - " +
                Moment(selectedCustomRange.to).format('MM/DD/YY')
        }
    }

	render() {
		const { selectedPreset, selectedCustomRange, open } = this.state

		let className = "select date-range-select"
		if (open) className += " open"

		return (
			<div className={className} ref={this.wrapperRef}>
				<div className="select-summary" onClick={this.handleClick}>{this.getSummary()}</div>
				<div className="dropdown">
                    {rangePresets.map((preset) => {
                        return <div key={preset.name}
                            className={selectedPreset && selectedPreset.name === preset.name ? 'selected' : null}
                            onClick={this.getPresetHandler(preset)}>
                                {preset.title}
                        </div>
                    })}
                    <div className="custom-range">
                        <div className="custom-range-title" onClick={this.handleCustomRangeClick}>{"Custom range"}</div>
                        {selectedCustomRange !== null && <CalendarDateRangeSelect propagate={this.handleCustomRangeSelection} />}
                    </div>
				</div>
			</div>
		);
	}	
}
