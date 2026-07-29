
import { useEffect, useSyncExternalStore } from 'react'
import { connect, startGame } from "./connect";
import { useNavigate } from "react-router";
import lobbyStore from "./lobbyStore";
import homeStore from "./homeStore";


export default function Lobby() {
    let navigate = useNavigate();
    // TODO: create a lobby screen and navigate to game with React Router on game start
    const lobbyState = useSyncExternalStore(lobbyStore.subscribe, lobbyStore.getSnapshot);
    const homeState = useSyncExternalStore(homeStore.subscribe, homeStore.getSnapshot);


    useEffect(() => {
        connect();
    }, []);

    console.log("isGameStarted", lobbyState.isGameStarted)
    useEffect(() => {
        if (lobbyState.isGameStarted) navigate("/game")
    }, [lobbyState.isGameStarted, navigate])

    return (
        <>
            <ul>
                {
                    lobbyState.players.map((clientId) => {
                        return <li key={clientId}>
                            {clientId}{clientId === homeState.clientId && " You"}
                        </li>
                    })
                }

            </ul>
            <div>
                <button onClick={() => startGame()}>Start Game</button>
            </div>
        </>
    )
}