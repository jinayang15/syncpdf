import { useEffect, useSyncExternalStore } from 'react';
import { createGame } from './connect';
import './Home.css'
import { useNavigate } from "react-router";
import lobbyStore from './lobbyStore';
import { connect } from './connect';

function Home() {
    let navigate = useNavigate();
    const lobbyState = useSyncExternalStore(lobbyStore.subscribe, lobbyStore.getSnapshot);
    const roomId = lobbyState.roomId;

    useEffect(() => {
        connect();
    }, []);

    useEffect(() => {
        if (roomId) navigate("/lobby")
    }, [navigate, roomId])

    // TODO: Display joinable lobbies
    return (
        <>
            <div>


            </div>
            <button id="create-game" type="button" onClick={() => createGame()}>Create Game</button >
        </>
    )



}

export default Home
