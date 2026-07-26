import { useEffect, useSyncExternalStore } from 'react';
import { createGame } from './connect';
import './Home.css'
import { useNavigate } from "react-router";
import lobbyStore from './lobbyStore';
import homeStore from './homeStore';
import { connect } from './connect';
import ListGame from './ListGame';

function Home() {
    let navigate = useNavigate();
    const lobbyState = useSyncExternalStore(lobbyStore.subscribe, lobbyStore.getSnapshot);
    const homeState = useSyncExternalStore(homeStore.subscribe, homeStore.getSnapshot);
    const roomId = lobbyState.roomId;

    useEffect(() => {
        connect()
    }, [])

    useEffect(() => {
        if (roomId) navigate("/lobby")
    }, [navigate, roomId])

    // TODO: Display joinable lobbies
    return (
        <>
            <ul>
                {homeState.lobbies.map((roomId) =>
                    <li key={roomId}><ListGame roomId={roomId} /></li>
                )}
            </ul>
            <button
                id="create-game"
                type="button"
                onClick={() => createGame()}
            >
                Create Room
            </button >
        </>
    )



}

export default Home
