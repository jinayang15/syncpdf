let clientId = "aaa";
let roomId = null;
let listeners = [];
let snapshot = { clientId, roomId }

const lobbyStore = {
    get clientId() { return clientId; },
    get roomId() { return roomId; },
    updateClientId(newId) {
        clientId = newId
        snapshot = { clientId, roomId }
        emitChange()
    },
    updateRoomId(newId) {
        roomId = newId
        snapshot = { clientId, roomId }
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