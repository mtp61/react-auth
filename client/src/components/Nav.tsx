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
            <span style={{backgroundColor: color}}>{text}</span>
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
                            <span onClick={onClickLogout}>Log Out</span>
                        </li>
                        <li className="nav-divider right">|</li>
                        <li className="nav-item right">
                            <span>{authContext.username || ""}</span>
                        </li>
                    </Fragment>
                ) : (
                    <Fragment>
                        <li className="nav-item right clickable">
                            <Link to="/signup">Sign Up</Link>
                        </li>
                        <li className="nav-divider right">|</li>
                        <li className="nav-item right clickable">
                            <Link to="/login">Log In</Link>
                        </li>
                        {
                            authContext.auth && (
                                <Fragment>
                                    <li className="nav-divider right">|</li>
                                    <li className="nav-item right">
                                        <span>{authContext.username || ""}</span>
                                    </li>
                                </Fragment>
                            )
                        }
                    </Fragment>
                )
            }
        </ul>
    );
};

export default Nav;