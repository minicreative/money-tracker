import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

export default class CalendarDateRangeSelect extends React.Component {

	constructor(props) {
		super(props);
		this.handleDayClick = this.handleDayClick.bind(this);
		this.handleResetClick = this.handleResetClick.bind(this);
		this.state = this.getInitialState();
	}

	getInitialState() {
		return {
			from: undefined,
			to: undefined,
		};
	}

	handleDayClick(day) {
		const range = DateUtils.addDayToRange(day, this.state);
		this.setState(range);
		if (range.from && range.to) this.props.propagate(range)
	}

	handleResetClick() {
		this.setState(this.getInitialState());
	}

	render() {
		const { from, to } = this.state;
		const modifiers = { start: from, end: to };
		return (
			<DayPicker
				numberOfMonths={1}
				selectedDays={[from, { from, to }]}
				modifiers={modifiers}
				onDayClick={this.handleDayClick}
			/>
		);
	}
}