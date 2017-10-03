declare module "rxjs-router5" {
    import * as Rx from "rxjs";
    import { State, Router } from "router5";

    interface RouterObservables {
        // an observable of your application route
        route$: Rx.Observable<State | null>;

        // a function returning an observable of route updates for the specified node.
        routeNode: (nodeName: string) => Rx.Observable<State>;

        // an observable of transition errors
        transitionError$: Rx.Observable<any>;

        // an observable of the currently transitioning route
        transitionRoute$: Rx.Observable<State>;
    }
    export default function createObservables(router: Router): RouterObservables;
}
