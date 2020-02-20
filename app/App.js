import React from 'react'
import { Route, Redirect, Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { AUTH_LANDING, NO_AUTH_LANDING } from './tools/Constants'
import Authentication from './tools/Authentication'

// Components and views
import Header from './components/Header'
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import TransactionsView from './views/TransactionsView'
import CategoriesView from './views/CategoriesView'
import InsightsView from './views/InsightsView'
import SettingsView from './views/SettingsView'

// Icon setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
library.add(faTrash, faPlusCircle)

// Create history
const history = createBrowserHistory();
export default class App extends React.Component{
	render() {
		return (
			<div className="container">
				<Router history={history}>
					<Header history={history} />
					<Route exact path="/">
						{Authentication.isAuthenticated() 
							? <Redirect to={AUTH_LANDING} /> 
							: <Redirect to={NO_AUTH_LANDING} />}
					</Route>
					<Route path="/login" render={props => <LoginView inside={false} {...props} />}></Route>
					<Route path="/signup" render={props => <SignupView inside={false} {...props} />}></Route>
					<Route path="/transactions" render={props => <TransactionsView inside={true} {...props} />}></Route>
					<Route path="/categories" render={props => <CategoriesView inside={true} {...props} />}></Route>
					<Route path="/insights" render={props => <InsightsView inside={true} {...props} />}></Route>
					<Route path="/settings" render={props => <SettingsView inside={true} {...props} />}></Route>
				</Router>
			</div>
		);
	}
}