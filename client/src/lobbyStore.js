let roomId = null;
let listeners = [];
let snapshot = { roomId }

const lobbyStore = {
    get roomId() { return roomId; },
    updateRoomId(newId) {
        roomId = newId
        snapshot = { roomId }
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