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

interface ObserveProps {
    // tslint:disable-next-line:no-any
    [name: string]: Rx.Observable<any>;
}

// A debugging component to show observables that are driving the view
function DebugObservablesWidget(props: ObserveProps) {
    const eye = require("./eye.svg");
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
    onInput: (value: string) => void;
}

function BasicInput(props: BasicInputProps) {
    return (
        <input
            type="text"
            onInput={(event: React.FormEvent<HTMLInputElement>) => {
                const value = event.currentTarget.value;
                props.onInput(value);
            }}
        />
    );
}

interface QueryFormProps {
    formName: string;
    inputName: string;
    onInput: (input: string) => void;
    result: object;
}

function QueryForm(props: QueryFormProps) {
    return (
        <fieldset className="query-form container">
            <legend>{props.formName}</legend>
            <span>{props.inputName}: </span>
            <BasicInput onInput={val => props.onInput(val || "")} />
            <p />
            <QueryFormResults result={props.result} />
        </fieldset>
    );
}

interface QueryFormTextFieldProps {
    // tslint:disable-next-line:no-any
    value: any;
}
function QueryFormTextField(props: QueryFormTextFieldProps) {
    return (
        <input
            type="text"
            readOnly={true}
            className="query-form value"
            onClick={event => event.currentTarget.select()}
            value={JSON.stringify(props.value, null, " ")}
        />
    );
}

interface QueryFormResultsProps {
    result: object;
}

function QueryFormResults(props: QueryFormResultsProps) {
    function helper(obj: object, prefix: string[] = []): JSX.Element[] {
        let result: JSX.Element[] = [];
        Object.keys(obj).forEach(field => {
            const value = obj[field];
            const path = [...prefix, field];
            const pathName = [...prefix, field].join(".");
            result.push(
                <div key={pathName} className="query-form row">
                    <span className="query-form field-name">{pathName + ": "}</span>
                    <QueryFormTextField value={value} />
                </div>
            );
            if (value && typeof value === "object") {
                result = [...result, ...helper(value, path)];
            }
        });

        return result;
    }
    return <div className="query-form responses">{helper(props.result)}</div>;
}

export function createHandler<T>(): Recompose.EventHandlerOf<T, Rx.Observable<T>> {
    return Recompose.createEventHandler();
}

interface AppViewModelInputs {
    onInput$: Rx.Observable<string>;
}

interface AppViewModelOutputs {
    routerPath: string;
    onInput: string;
}

function AppViewModel(inputs: AppViewModelInputs) {
    const router = createRouter(routes)
        .usePlugin(browserPlugin({}))
        .start();
    const { route$, routeNode, transitionError$, transitionRoute$ } = createObservables(router);

    const { onInput$ } = inputs;
    const initial = "home";
    const input$ = onInput$.debounceTime(100).startWith(initial);

    const computedOutput$ = input$.map(input => ({
        input: input,
        buildPath: router.buildPath(input, {})
    }));

    const navigatePath$ = computedOutput$
        .filter(({ buildPath }) => buildPath !== "")
        .do(({ input }) => router.navigate(input));

    const output$ = Rx.Observable
        .combineLatest(computedOutput$, navigatePath$, route$, transitionError$, transitionRoute$)
        .map(([computedOutput, _, route, transitionError, transitionRoute]) => ({
            ...computedOutput,
            route,
            transitionError,
            transitionRouteName: transitionRoute && transitionRoute.name
        }));

    return output$;
}

const App = Recompose.componentFromStream(props$ => {
    const { handler: onInput, stream: onInput$ } = createHandler<string>();
    const output$ = AppViewModel({ onInput$ });

    // Example query forms. Consider making the input an object and the name derived from it? Reduces parameters needed.
    return output$.map(output => (
        <div key="none" className="App">
            <div className="App-header">
                <h2>Welcome to React</h2>
            </div>
            <DebugObservablesWidget />
            <QueryForm
                formName="Router path"
                inputName="Route name"
                onInput={onInput}
                result={output}
            />
        </div>
    ));
});

export default App;
