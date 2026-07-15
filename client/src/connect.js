import boardStore from "./boardStore";
import lobbyStore from "./lobbyStore";
const port = 1515

let connected = false;
let ws;

let isAwaitingServer = false;
let serverListeners = [];

const isAwaitingServerStore = {
    setIsAwaitingServer(bool) {
        isAwaitingServer = bool
        emitChange()
    },
    subscribe(listener) {
        serverListeners = [...serverListeners, listener];
        return () => {
            serverListeners = serverListeners.filter(l => l !== listener)
        }
    },
    getSnapshot() {
        return isAwaitingServer;
    }
}

function emitChange() {
    for (let listener of serverListeners) {
        listener()
    }
}

function connect() {
    if (connected) return;
    ws = new WebSocket(`ws://localhost:${port}`);
    connected = true;

    ws.addEventListener("open", () => {
        console.log("CONNECTED")
    })

    ws.addEventListener("message", (e) => {
        isAwaitingServerStore.setIsAwaitingServer(false);
        console.log(e.data)
        const message = JSON.parse(e.data)
        switch (message.type) {
            case "new-client-created": {
                lobbyStore.updateClientId(message.clientId)
                break;
            }
            case "board-update": {
                boardStore.loadBoard(message.board, message.isGameEnd)
                break;
            }
            case "room-created": {
                lobbyStore.updateRoomId(message.roomId)
                break;
            }
        }
    })

    ws.addEventListener("close", () => {
        connected = false;
    })
}

function sendSet(cards) {
    if (cards.length !== 3) throw new Error("Incorrect number of cards")

    isAwaitingServerStore.setIsAwaitingServer(true);
    ws.send(JSON.stringify({ "clientId": lobbyStore.clientId, "type": "message", "action": "board-update", "cards": cards }))
}

function createNewClient() {
    if (lobbyStore.clientId) return lobbyStore.clientId;
    ws.send(JSON.stringify({ "type": "create-new-client" }))
}

function createGame() {
    console.log("creating room", lobbyStore.clientId)
    ws.send(JSON.stringify({ "type": "create-room", "clientId": lobbyStore.clientId }))
}

function joinGame() {
    ws.send(JSON.stringify({ "type": "join-game", "roomId": lobbyStore.roomId, "clientId": lobbyStore.clientId }))
}

function startGame() {
    ws.send(JSON.stringify({ type: "start-game", clientId: lobbyStore.clientId }))
}

export { isAwaitingServerStore, connect, sendSet, createNewClient, createGame, joinGame, startGame }


