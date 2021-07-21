import type { FC } from "react";
import { useState, useContext, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import type AuthContextType from "../../types/AuthContextType";
import { AuthContext } from "../AuthManager";

const GamePage: FC = () => {
    const [player, setPlayer] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const history = useHistory();
    const authContext: AuthContextType = useContext(AuthContext);
    const id = useParams<{ id: string }>();

    // wait for connection
    useEffect(() => {
        if (loading && authContext.socket) {
            authContext.socket.emit("connect-game", id);

            // TODO setup listeners
            // authContext.socket.removeAllListeners("index-update");

            setLoading(false);

            console.log("connected with game connection");
        }

        if (!loading && !authContext.socket) {
            setLoading(true);

            console.log("lost game connection");
        }
    }, [authContext.socket, loading, history, id]);

    // remove listeners on unmount
    useEffect(() => {
        return (() => {
            if (authContext.socket) {
                // TODO
                
                // authContext.socket.removeAllListeners("index-update");
            }
        });
    // eslint-disable-next-line
    }, []);

    // TODO
    const rock = () => {

    };

    const paper = () => {

    };

    const scissors = () => {

    };

    return (
        <div>
            <h1>Game Page</h1>
            {
                player ? (
                    <>
                        <button onClick={rock}>Rock</button>
                        <button onClick={paper}>Paper</button>
                        <button onClick={scissors}>Scissors</button>
                    </>
                ) : (
                    <>

                    </>
                )
            }
            
        </div>
    );
};

export default GamePage;
