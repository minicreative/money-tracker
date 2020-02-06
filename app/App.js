import React from 'react'
import { Route, Redirect, BrowserRouter } from 'react-router-dom'

import { AUTH_LANDING, NO_AUTH_LANDING } from './tools/Constants'
import Authentication from './tools/Authentication'

// Import views
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import TransactionsView from './views/TransactionsView'
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
					<Route path="/transactions" render={props => <TransactionsView needsAuth={true} {...props} />}></Route>
				</BrowserRouter>
			</div>
		);
	}
}