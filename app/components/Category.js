/** @namespace components/Category */
import React from 'react'
import Requests from '../tools/Requests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EDIT_TIMER } from '../tools/Constants'

function getFieldStateForCategory (category) {
	return {
		name: category.name ? category.name : '',
		parent: category.parentName ? category.parentName : '',
	}
}

export default class Category extends React.Component {

	constructor(props) {
		super(props)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	state = {
		edited: false,
		loading: false,
		fields: {
			name: '',
			parent: '',
		},
	}

	componentDidMount() {
		this._isMounted = true
		this.setState({ fields: getFieldStateForCategory(this.props.category) })
	}

	componentWillUnmount() {
		this._isMounted = false
	}

	handleChange(event) {
		this.lastEdited = Date.now()
		const { fields } = this.state
		fields[event.target.name] = event.target.value
		if (this._isMounted) this.setState({ fields, edited: true })

		// Setup timer for updates
		setTimeout(() => {
			if (Date.now()-this.lastEdited > EDIT_TIMER) this.update()
		}, EDIT_TIMER)
	}

	update() {
		const { fields } = this.state
		const request = {
			guid: this.props.category.guid,
			name: fields.name,
			parentName: fields.parent,
		}
		if (this._isMounted) this.setState({ edited: false, loading: true })
		Requests.do('category.edit', request).then((response) => {
			if (response.category) {
				this.props.update(response.category)
				if (this._isMounted) this.setState({ loading: false, fields: getFieldStateForCategory(response.category) })
			}
		})
	}

	delete() {
		if (this._isMounted) this.setState({ loading: true })
		Requests.do('category.delete', { guid: this.props.category.guid }).then((response) => {
			if (response.category) {
				this.props.update(response.category)
			}
		})
	}

	render() {
		const { edited, loading, fields } = this.state
		return (
			<li className="row category">
				<div className={`column name`}>
					<input name="name" type="text" value={fields.name} onChange={this.handleChange} />
				</div>
				<div className={`column parent`}>
					<input name="parent" type="text" value={fields.parent} onChange={this.handleChange} />
				</div>
				<div className="column check right">
					{loading ? "..." : edited ? "e" : "s"}
					<FontAwesomeIcon icon="trash" onClick={this.delete} />
				</div>
			</li>
		)
	}
}
