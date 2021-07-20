import { FC, Fragment } from "react";
import { useState, useCallback, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import AuthContextType from "../types/AuthContextType";
import { AuthContext } from "./AuthManager";

const LoginPage: FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorText, setErrorText] = useState<string>("");
    const history = useHistory();
    const authContext: AuthContextType = useContext(AuthContext);

    const submit = () => {
        if (!username) {
            setErrorText("No username")
            return;
        }
        if (!password) {
            setErrorText("No password")
            return;
        }
        if (!authContext.callbacks) {
            setErrorText("Callback not defined")
            return;
        }

        authContext.callbacks.login(username, password)
            .then((resp: { success: boolean, message?: string }) => {
                if (resp.success) {
                    history.push("/");
                } else {
                    setErrorText(resp.message || "");

                }
            });
    };

    return (
        <div>
            <h1>Login</h1>
            Username:
            {' '}
            <input
                type="text"
                value={username}
                onChange={(e) => {setUsername(e.target.value)}}
            />
            <br />
            Password:
            {' '}
            <input
                type="text"
                value={password}
                onChange={(e) => {setPassword(e.target.value)}}
            />
            <br />
            Repeat Password:
            {
                errorText && (
                    <p style={{color: "red"}}>{errorText}</p>
                )
            }
            <button onClick={submit} >Submit</button>
        </div>
    );
}

export default LoginPage;
