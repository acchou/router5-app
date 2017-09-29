import * as React from "react";
import "./App.css";
import Router5, { errorCodes, transitionPath, loggerPlugin, createRouter } from "router5";

import browserPlugin from "router5/plugins/browser";
import listenersPlugin from "router5/plugins/listeners";

import * as Rx from "rxjs";
import * as Recompose from "recompose";
import rxjsConfig from "recompose/rxjsObservableConfig";

import createObservables from "rxjs-router5";

Recompose.setObservableConfig(rxjsConfig);

const routes = [
    { name: "home", path: "/home" },
    { name: "about", path: "/about" },
    { name: "users", path: "/users" },
    { name: "users.view", path: "/view" },
    { name: "users.list", path: "/list" }
];

const router = createRouter(routes);
const { route$, routeNode, transitionError$, transitionRoute$ } = createObservables(router);

const logo = require("./logo.svg");
const eye = require("./eye.svg");

interface ObserveProps {
    // tslint:disable-next-line:no-any
    [name: string]: Rx.Observable<any>;
}

// A debugging component to show observables that are driving the view
function DebugObservablesWidget(props: ObserveProps) {
    const widget = (
        <img src={eye} className="observe-widget" onClick={() => console.log("clicked widget")} />
    );
    const results = Object.keys(props).map(key => (
        <div className="observe-var">
            <div className="observe-key">{key}</div>
            <div className="observe-observable">{props[key]}</div>
        </div>
    ));
    return (
        <div className="observe-container">
            {widget}
            <div className="observe-panel">{results}</div>
        </div>
    );
}

interface BasicInputProps {
    onSubmit: (value: string | null) => void;
}

function BasicInput(props: BasicInputProps) {
    let value: string | null;

    return (
        <div className="basic-input">
            <input
                type="text"
                onChange={newValue => {
                    value = newValue.target.textContent;
                    props.onSubmit(value);
                }}
            />
            <input type="button" onClick={() => props.onSubmit(value)} value="submit" />
        </div>
    );
}

export function createHandler<T>(): Recompose.EventHandlerOf<T, Rx.Observable<T>> {
    return Recompose.createEventHandler();
}

interface AppViewModelInputs {
    submit$: Rx.Observable<string>;
}

interface AppViewModelOutputs {
    routerPath: string;
    input: string;
}

function AppViewModel(inputs: AppViewModelInputs) {
    const { submit$ } = inputs;
    const initial = "home";
    const input$ = submit$.startWith(initial);
    const output$ = input$.map(input => ({
        input: input,
        routerPath: router.buildPath(input, {})
    }));

    return output$;
}

const App = Recompose.componentFromStream(props$ => {
    const { handler: submit, stream: submit$ } = createHandler<string>();
    const output$ = AppViewModel({ submit$ });

    return output$.map(({ input, routerPath }) => (
        <div key="none" className="App">
            <div className="App-header">
                <h2>Welcome to React</h2>
            </div>
            <DebugObservablesWidget />
            <div className="form">
                <BasicInput onSubmit={val => submit(val ? val : "")} />
                <span className="response">input: {input}</span>
                <span className="response">routerPath: {routerPath}</span>
            </div>
        </div>
    ));
});

export default App;
