import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Home from './component/Home';
import AddCandidate from './component/Admin/AddCandidate/AddCandidate';
import Voting from './component/Voting/Voting';
import Results from './component/Results/Results';
import Registration from './component/Registration/Registration';
import Verification from './component/Admin/Verification/Verification';
import Footer from './component/Footer/Footer';
import test from './component/test';

// ...existing code...
export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/AddCandidate" component={AddCandidate} />
            {/* Pass contract address and network ID from env to components as props */}
            <Route exact path="/Voting" render={props => <Voting {...props} contractAddress={process.env.REACT_APP_CONTRACT_ADDRESS} networkId={process.env.REACT_APP_NETWORK_ID} />} />
            <Route exact path="/Results" render={props => <Results {...props} contractAddress={process.env.REACT_APP_CONTRACT_ADDRESS} networkId={process.env.REACT_APP_NETWORK_ID} />} />
            <Route exact path="/Registration" render={props => <Registration {...props} contractAddress={process.env.REACT_APP_CONTRACT_ADDRESS} networkId={process.env.REACT_APP_NETWORK_ID} />} />
            <Route exact path="/Verification" render={props => <Verification {...props} contractAddress={process.env.REACT_APP_CONTRACT_ADDRESS} networkId={process.env.REACT_APP_NETWORK_ID} />} />
            <Route exact path="/test" component={test} />
            <Route exact path="*" component={NotFound} />
          </Switch>
        </Router>
        <Footer />
      </div>
    );
  }
}
class NotFound extends Component {
  render() {
    return (
      <>
        <h1>404 NOT FOUND!</h1>
        <center>
          <p>
            The page your are looking for doesn't exist.
            <br />
            Go to{" "}
            <Link
              to="/"
              style={{ color: "black", textDecoration: "underline" }}
            >
              Home
            </Link>
          </p>
        </center>
      </>
    );
  }
}
