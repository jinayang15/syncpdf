
import { useEffect } from "react";
import { connect } from "./connect";
import { useNavigate } from "react-router";


export default function Lobby() {
    let navigate = useNavigate();
    // TODO: create a lobby screen and navigate to game with React Router on game start
    useEffect(() => {
        connect();
    }, []);

    return (
        <div>
            <button onClick={() => navigate("/game")}>Start Game</button>
        </div>
    )
}