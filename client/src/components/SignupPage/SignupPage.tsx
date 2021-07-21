import { FC } from "react";
import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import AuthContextType from "../../types/AuthContextType";
import { AuthContext } from "../AuthManager";

const SignupPage: FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");
    const [errorText, setErrorText] = useState<string>("");
    const history = useHistory();
    const authContext: AuthContextType = useContext(AuthContext);

    const submit = () => {
        if (!username) {
            setErrorText("No username")
            return;
        }
        if (!password1) {
            setErrorText("No password")
            return;
        }
        if (!password2) {
            setErrorText("No password confirmation")
            return;
        }
        if (password1 !== password2) {
            setErrorText("Passwords do not match");
            return;
        }
        if (!authContext.callbacks) {
            setErrorText("Callback not defined")
            return;
        }

        authContext.callbacks.signup(username, password1)
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
            <h1>Sign Up</h1>
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
                value={password1}
                onChange={(e) => {setPassword1(e.target.value)}}
            />
            <br />
            Repeat Password:
            {' '}
            <input
                type="text"
                value={password2}
                onChange={(e) => {setPassword2(e.target.value)}}
            />
            <br />
            {
                errorText && (
                    <p style={{color: "red"}}>{errorText}</p>
                )
            }
            <button onClick={submit} >Submit</button>
        </div>
    );
}

export default SignupPage;
