import { Fragment, useState, useEffect } from "react";
import type { FC } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthManager";
import { Link, useHistory } from "react-router-dom";
import "../styles/Nav.css";
import AuthContextType from "../types/AuthContextType";

const ConnectionIndicator: FC = () => {
    const authContext: AuthContextType = useContext(AuthContext);
    const [color, setColor] = useState<string>("red");
    const [text, setText] = useState<string>("disconnected");
    
    useEffect(() => {
        const timerId = setInterval(() => {
            if (authContext.socket && authContext.socket.connected) {
                setText("connected");
                setColor("green");
            } else {
                setText("disconnected");
                setColor("red");
            }
        }, 1000);

        // clean up
        return () => {
            clearInterval(timerId);
        };
    }, [authContext.socket]);

    return (
        <li className="nav-item right">
            <a style={{backgroundColor: color}}>{text}</a>
        </li>
    );
};

const Nav: FC = () => {
    const authContext: AuthContextType = useContext(AuthContext);
    const history = useHistory();

    const onClickLogout = () => {
        if (authContext.callbacks) {
            authContext.callbacks.logout();
            history.push("/");
        }
    };

    return (
        <ul className="nav">
            <li className="nav-item left clickable">
                <Link to="/">Home</Link>
            </li>
            <ConnectionIndicator />
            <li className="nav-divider right">|</li>
            {
                authContext.auth && !authContext.guest ? (
                    <Fragment>
                        <li className="nav-item right clickable">
                            <a onClick={onClickLogout}>Log Out</a>
                        </li>
                        <li className="nav-divider right">|</li>
                        <li className="nav-item right">
                            <a>{authContext.username || ""}</a>
                        </li>
                    </Fragment>
                ) : (
                    <li className="nav-item right clickable">
                        <Link to="/login">Log In</Link>
                    </li>
                )
            }
        </ul>
    );
};

export default Nav;