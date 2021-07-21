import type { FC } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import HistoryPage from "./HistoryPage";
import GamePage from "./GamePage";
import Nav from "./Nav";

interface RouteType {
    path: string,
    exact?: boolean,
    component: FC,
}

const Routes: RouteType[] = [
    { path: "/", exact: true, component: HomePage },
    { path: "/login", component: LoginPage },
    { path: "/signup", component: SignupPage },
    { path: "/history", component: HistoryPage },
    { path: "/game/:id", component: GamePage },
];

const PageRouter: FC = () => {
    return (
        <Router>
            <Nav />
            <Switch>
                {
                    Routes.map((route: RouteType, index: number) => (
                        <Route
                            path={route.path}
                            exact={route.exact || false}
                            key={index.toString()}
                        >
                            <route.component />
                        </Route>
                    ))
                }
            </Switch>
        </Router>
    );
}

export default PageRouter;
