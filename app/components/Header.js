import React from 'react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, NO_AUTH_LANDING } from './../tools/Constants'
import Authentication from './../tools/Authentication'

export default class Header extends React.Component{
	
	state = {
		inside: Authentication.isAuthenticated()
	}

	componentDidMount() {
		this.props.history.listen(() => {
			this.setState({ inside: Authentication.isAuthenticated() })
		})
	}

	logout() {
		Authentication.logout();
	}

	render() {
		const { inside } = this.state
		return (
			<header className={inside ? "inside" : null}>
				<div className="logo">{APP_NAME}</div>
				{inside ? <div className="navigation main_nav">
					<NavLink to="/transactions">{"Transactions"}</NavLink>
					<NavLink to="/categories">{"Categories"}</NavLink>
					<NavLink to="/insights">{"Insights"}</NavLink>
				</div> : null}
				{inside ? <div className="navigation user_nav">
					<NavLink to="/settings">{"Settings"}</NavLink>
					<NavLink to={NO_AUTH_LANDING} onClick={this.logout}>{"Logout"}</NavLink>
				</div> : null}
			</header>
		);
	}
}