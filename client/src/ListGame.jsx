
import { joinGame } from "./connect"

export default function ListGame({ roomId }) {
    return <button className="list-game" onClick={() => joinGame(roomId)}>{roomId}</button>
}