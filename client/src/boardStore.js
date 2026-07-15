let board = [];
let isGameEnd = false;
let listeners = [];
let snapshot = { board, isGameEnd }

const boardStore = {
    loadBoard(newBoard, bool) {
        board = [...newBoard]
        isGameEnd = bool
        snapshot = { board, isGameEnd }
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

export default boardStore;