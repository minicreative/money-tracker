import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import Authentication from './../tools/Authentication'

export default class View extends React.Component {
	constructor(props) {
		super(props)
		let isAuthenticated = Authentication.getToken() || false
		let { needsAuth, history } = props
		if ((needsAuth && !isAuthenticated) || (!needsAuth && isAuthenticated)) {
			history.replace('/')
		}
	}
}

