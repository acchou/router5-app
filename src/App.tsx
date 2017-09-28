import * as React from "react";
import "./App.css";
import Router5, { errorCodes, transitionPath, loggerPlugin, createRouter } from "router5";

import browserPlugin from "router5/plugins/browser";
import listenersPlugin from "router5/plugins/listeners";

import * as Rx from "rxjs";

import createObservables from "rxjs-router5";

const routes = [{ name: "home", path: "/home" }, { name: "about", path: "/about" }];

const { route$, routeNode, transitionError$, transitionRoute$ } = createObservables(
    createRouter(routes)
);

const logo = require("./logo.svg");

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.tsx</code> and save to reload.
                </p>
            </div>
        );
    }
}

export default App;
