let roomId = null;
let players = [];
let isGameStarted = false;
let listeners = [];
let snapshot = { roomId, players, isGameStarted }

const lobbyStore = {
    get roomId() { return roomId; },
    get players() { return players; },
    get isGameStarted() { return isGameStarted },
    updateRoomId(newId) {
        roomId = newId
        snapshot = { roomId, players, isGameStarted }
        emitChange()
    },
    updatePlayers(newPlayers) {
        players = newPlayers
        snapshot = { roomId, players, isGameStarted }
        emitChange()
    },
    setGameStarted(newStarted) {
        isGameStarted = newStarted
        snapshot = { roomId, players, isGameStarted }
        emitChange()
    },
    subscribe(listener) {
        listeners = [...listeners, listener];
        return () => {
            listeners = listeners.filter(l => l !== listener)
        }
    },
    getSnapshot() {
        return snapshot;
    }
}

function emitChange() {
    for (let listener of listeners) {
        listener()
    }
}

export default lobbyStore;