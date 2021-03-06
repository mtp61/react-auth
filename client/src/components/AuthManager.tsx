import type { FC } from "react";
import { createContext, useEffect, useState } from "react";
import UserInfoType from "../types/UserInfoType";
import AuthContextType from "../types/AuthContextType";
import PageRouter from "./PageRouter";
import fetch from "node-fetch";
import { io } from "socket.io-client";

export const AuthContext = createContext({ auth: false });

const AuthManager: FC = () => {
    const [authContext, setAuthContext] = useState<AuthContextType>({ auth: false });

    const createSocket = (context?: AuthContextType) => {
        if ((context && !context.auth) || (!context && !authContext.auth)) {
            console.log("Failed new socket creation -- no auth");
            return;
        }

        // create a socket with authentication
        const token = context ? context.token : authContext.token;
        const socket = io("http://localhost:5000", { 
            auth: { token: token },
        });

        setAuthContext(prevAuthContext => ({
            auth: true,
            guest: prevAuthContext.guest,
            username: prevAuthContext.username,
            token: prevAuthContext.token,
            socket: socket,
            callbacks: getCallbacks(),
        }));
    }

    const saveContext = (context?: AuthContextType) => {
        // will only save if the required fields are present in context
        const requiredKeys = ["auth", "guest", "username", "token"];
        let userInfo: UserInfoType;
        if (!context) {
            if (!requiredKeys.every(key => {
                if (!Object.keys(authContext).includes(key)) {
                    return false;
                }
                return true;
            })) {
                return;
            }

            userInfo = {
                auth: authContext.auth,
                guest: authContext.guest || false,
                username: authContext.username || "",
                token: authContext.token || "",
            };
        } else {
            if (!requiredKeys.every(key => {
                if (!Object.keys(context).includes(key)) {
                    return false;
                }
                return true;
            })) {
                return;
            }

            userInfo = {
                auth: context.auth,
                guest: context.guest || false,
                username: context.username || "",
                token: context.token || "",
            };
        }

        localStorage.setItem("userInfo", JSON.stringify(userInfo));
    };

    // returns true if found context, false otherwise
    const loadContext = (): { success: boolean, context?: AuthContextType } => {
        // check local storage for info
        const localUserInfoString: string | null = localStorage.getItem("userInfo");
        if (localUserInfoString) {
            let localUserInfo: UserInfoType;
            try {
                localUserInfo = JSON.parse(localUserInfoString);
            } catch {
                return { success: false };
            }

            const requiredKeys = ["auth", "guest", "username", "token"];
            if (!requiredKeys.every(key => {
                if (!Object.keys(localUserInfo).includes(key)) {
                    return false;
                }
                return true;
            })) {
                return { success: false };
            }

            // make sure context is authenticated
            if (!localUserInfo.auth) {
                return { success: false };
            }

            const context = {
                auth: localUserInfo.auth,
                guest: localUserInfo.guest,
                username: localUserInfo.username,
                token: localUserInfo.token,
                callbacks: getCallbacks(),
            };
            setAuthContext(context);
            return { success: true, context: context };
        }
        return { success: false };
    };

    const loginCallback = async (username: string, password: string) => {
        console.log(`Attempting to login with username "${username}" and password "${password}"`);

        const body = {
            username: username,
            password: password,
        };

        // TODO save urls in utils/api.ts
        return fetch("http://localhost:4000/login", {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            method: "POST",
        }).then(data => {
            console.log(`Status: ${data.status}`);
            return data.json();
        }).then(json => {
            if (Object.keys(json).includes("message")) {
                console.log(`Message: ${json.message}`)
            }

            if (!json.token) {
                console.log("Error: No token returned")
                return {
                    success: false,
                    message: json.message,
                };
            }

            const context = {
                auth: true,
                guest: false,
                username: username,
                token: json.token,
                callbacks: getCallbacks(),
            };
            setAuthContext(context);
            createSocket(context);
            saveContext(context);

            return { success: true };
        }).catch(err => {
            console.log(`Error: ${err}`);
        });
    };

    const signupCallback = (username: string, password: string) => {
        console.log(`Attempting to sign up with username "${username}" and password "${password}"`);

        const body = {
            username: username,
            password: password,
        };

        // TODO save urls in utils/api.ts
        return fetch("http://localhost:4000/signup", {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            method: "POST",
        }).then(data => {
            console.log(`Status: ${data.status}`);
            return data.json();
        }).then(json => {
            if (Object.keys(json).includes("message")) {
                console.log(`Message: ${json.message}`)
            }

            if (!json.token) {
                console.log("Error: No token returned")
                return {
                    success: false,
                    message: json.message,
                };
            }

            const context = {
                auth: true,
                guest: false,
                username: username,
                token: json.token,
                callbacks: getCallbacks(),
            };
            setAuthContext(context);
            createSocket(context);
            saveContext(context);

            return { success: true };
        }).catch(err => {
            console.log(`Error: ${err}`);
            return {success: false };
        });
    };

    const logoutCallback = () => {
        setAuthContext(getAuthContextDefault());
        localStorage.clear();
        getGuestAuth();
    };

    const getCallbacks = () => ({
        login: loginCallback,
        signup: signupCallback,
        logout: logoutCallback,
    });

    const getAuthContextDefault = () => ({
        auth: false,
        callbacks: getCallbacks(),
    });

    const getGuestAuth = () => {
        console.log("Getting guest auth token");
        
        fetch("http://localhost:4000/guest", {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
            method: "POST",
        }).then(data => {
            console.log(`Status: ${data.status}`);
            return data.json();
        }).then(json => {
            if (!json.token) {
                console.log("Error: No token returned")
                return;
            }
            if (!json.username) {
                console.log("Error: No username returned")
                return;
            }

            const context = {
                auth: true,
                guest: true,
                username: json.username,
                token: json.token,
                callbacks: getCallbacks(),
            };
            setAuthContext(context);
            createSocket(context);
            saveContext(context);
        }).catch(err => {
            console.log(`Error: ${err}`);
        });
    };

    // manage user info on page load
    useEffect(() => {
        console.log("attempting to load context from local storage");
        const result = loadContext();
        if (result.success) {
            console.log("loaded context from local storage");
            createSocket(result.context);
        } else {
            console.log("no context in local storage");
            
            setAuthContext(getAuthContextDefault());
            getGuestAuth();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={authContext}>
            <PageRouter />
        </AuthContext.Provider>
    );
}

export default AuthManager;
