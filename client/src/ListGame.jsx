export default function ListGame(joinGame, roomId) {
    return <div class="list-game" onClick={() => joinGame(roomId)}>{roomId}</div>
}