import type { FC } from "react";
import { useEffect, useContext } from "react";
import AuthContextType from "../types/AuthContextType";
import { AuthContext } from "./AuthManager";

const HomePage: FC = () => {
    const authContext: AuthContextType = useContext(AuthContext);

    return (
        authContext.auth ? (
            <div>
                This is the home page
                <div>
                    <p>Authenticated as {authContext.guest ? "guest" : "user"}</p>
                    <p>Your username is {authContext.username}</p>
                </div>
            </div>
        ) : (
            <div>
                Waiting for auth...
            </div>
        )
    ); 
}

export default HomePage;
