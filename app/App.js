
// Import dependencies
import React from 'react'
import { Route, Redirect, BrowserRouter, Switch } from 'react-router-dom'

// Import constants
import { AUTH_LANDING, NO_AUTH_LANDING } from './tools/Constants'

import Authentication from './tools/Authentication'

// Import views
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import DashboardView from './views/DashboardView'
export default class App extends React.Component{
	render() {
		const isAuthenticated = Authentication.getToken() || false;
		return (
			<div className="app">
				<BrowserRouter>
					<Route exact path="/">
						{isAuthenticated ? <Redirect to={AUTH_LANDING} /> : <Redirect to={NO_AUTH_LANDING} />}
					</Route>
					<Route path="/login" render={props => <LoginView needsAuth={false} {...props} />}></Route>
					<Route path="/signup" render={props => <SignupView needsAuth={false} {...props} />}></Route>
					<Route path="/dashboard" render={props => <DashboardView needsAuth={true} {...props} />}></Route>
				</BrowserRouter>
			</div>
		);
	}
}