
// Import dependencies
import React, { Component } from 'react';
import { Route } from 'react-router-dom';

// Import views
import LoginView from './views/LoginView';

class App extends Component {
	render() {
		return (
			<div className="app">
				<Route path="/login" component={LoginView} />
			</div>
		);
  	}
}

export default App;
