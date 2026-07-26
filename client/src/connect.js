import boardStore from "./boardStore";
import lobbyStore from "./lobbyStore";
import homeStore from "./homeStore";
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
        const message = JSON.parse(e.data)
        console.log(message)
        switch (message.type) {
            case "new-client-created": {
                homeStore.updateClientId(message.clientId)
                break;
            }
            case "lobbies-list": {
                homeStore.updateLobbies(message.lobbies)
                break;
            }
            case "board-update": {
                boardStore.loadBoard(message.board, message.isGameEnd)
                break;
            }
            case "room-joined":
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
    ws.send(JSON.stringify({ "clientId": homeStore.clientId, "type": "message", "action": "board-update", "cards": cards }))
}

function createNewClient() {
    if (homeStore.clientId) return homeStore.clientId;
    ws.send(JSON.stringify({ "type": "create-new-client" }))
}

function createGame() {
    console.log("creating room", homeStore.clientId)
    ws.send(JSON.stringify({ "type": "create-room", "clientId": homeStore.clientId }))
}

function joinGame(roomId) {
    ws.send(JSON.stringify({ "type": "join-room", "roomId": roomId, "clientId": homeStore.clientId }))
}

function startGame() {
    ws.send(JSON.stringify({ type: "start-game", clientId: homeStore.clientId }))
}

export { isAwaitingServerStore, connect, sendSet, createNewClient, createGame, joinGame, startGame }


