/** @namespace components/View */
import React from 'react'
import Authentication from './../tools/Authentication'
export default class View extends React.Component {
	constructor(props) {
		super(props)
		let { needsAuth, history } = props
		let isAuthenticated = Authentication.getToken() || false
		if ((needsAuth && !isAuthenticated) || (!needsAuth && isAuthenticated)) {
			history.replace('/')
		}
	}
}

