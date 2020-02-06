/** @namespace components/UploadModal */
import React from 'react'
import Requests from './../tools/Requests'

export default class Import extends React.Component {

	constructor(props) {
		super(props)
		this.fileInput = React.createRef()
	}

	upload = (event) => {
		event.preventDefault()
		const { onSuccess } = this.props;
		const reader = new FileReader()
		reader.onload = event => {
			let text = event.target.result
			Requests.do('transaction.import', {
				csv: text
			}).then(response => {
				if (onSuccess) onSuccess()
			})
		}
		reader.readAsText(this.fileInput.current.files[0])
	}

	render() {
		return (
			<form onSubmit={this.upload}>
				<input type="file" ref={this.fileInput}></input>
				<input type="submit"></input>
			</form>
		)
	}
}

