import boardStore from "./boardStore";
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
                boardStore.updateClientId(message.clientId)
                break;
            }
            case "board-update": {
                boardStore.loadBoard(message.board, message.isGameEnd)
                break;
            }
        }
    })
}

function sendSet(cards) {
    if (cards.length !== 3) throw new Error("Incorrect number of cards")

    isAwaitingServerStore.setIsAwaitingServer(true);
    ws.send(JSON.stringify({ "type": "board-update", "cards": cards }))
}

function createNewClient() {
    if (boardStore.clientId) return boardStore.clientId;
    ws.send(JSON.stringify({ "type": "create-new-client" }))
}

export { connect, sendSet, createNewClient, isAwaitingServerStore }


