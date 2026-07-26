let clientId = "aaa";
let lobbies = [];
let listeners = [];
let snapshot = { clientId, lobbies }

const homeStore = {
    get clientId() { return clientId; },
    get lobbies() { return lobbies; },
    updateClientId(newId) {
        clientId = newId
        snapshot = { clientId, lobbies }
        emitChange()
    },
    updateLobbies(newLobbies) {
        lobbies = newLobbies
        snapshot = { clientId, lobbies }
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

export default homeStore;