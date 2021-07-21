import type { FC } from "react";
import { useState, useEffect, useContext } from "react";
import AuthContextType from "../../types/AuthContextType";
import { AuthContext } from "../AuthManager";
import { useHistory } from "react-router-dom";

interface GameRow {
    id: string,
    users: string,
    status: string,
}

const HomePage: FC = () => {
    const authContext: AuthContextType = useContext(AuthContext);
    const history = useHistory();
    const [loading, setLoading] = useState<boolean>(true);
    const [gameRows, setGameRows] = useState<GameRow[]>([]);
    const [creatingGame, setCreatingGame] = useState<boolean>(false);

    // wait for connection
    useEffect(() => {
        if (loading && authContext.socket) {
            authContext.socket.emit("connect-index");
            authContext.socket.removeAllListeners("index-update");
            authContext.socket.removeAllListeners("game-join");
            authContext.socket.on("index-update", (rows: GameRow[]) => {
                setGameRows(rows);
            });
            authContext.socket.on("game-join", (id: string) => {
                history.push(`/game/${id}`);
            });
            setLoading(false);

            console.log("connected with index connection");
        }

        if (!loading && !authContext.socket) {
            setLoading(true);

            console.log("lost index connection");
        }
    }, [authContext.socket, loading, history]);

    // remove listeners on unmount
    useEffect(() => {
        return (() => {
            if (authContext.socket) {
                authContext.socket.removeAllListeners("index-update");
            }
        });
    // eslint-disable-next-line
    }, []);

    const getGameRows = () => {
        return gameRows.map(row => (
            <tr
                onClick={() => {
                    history.push(`/game/${row.id}`);
                }}
                key={row.id}
            >
                <td>{row.id}</td>
                <td>{row.users}</td>
                <td>{row.status}</td>
            </tr>
        ));
    };

    const createGame = () => {
        if (!authContext.socket) {
            return;
        }

        // can't spam out creations
        if (creatingGame) {
            return;
        }

        setCreatingGame(true);
        authContext.socket.emit("create-game");
    };

    return (
        !loading ? (
            <div>
                <table style={{borderSpacing: "1em"}}>
                    <thead>
                        <tr>
                            <td>Game Id</td>
                            <td>Users</td>
                            <td>Status</td>
                        </tr>
                    </thead>
                    <tbody>
                        {getGameRows()}
                    </tbody>
                </table>
                <button onClick={createGame}>Create Game</button>
            </div>
        ) : (
            <div>
                Waiting for connection to game server
            </div>
        )
    ); 
}

export default HomePage;
