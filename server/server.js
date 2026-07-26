import { WebSocketServer, WebSocket } from "ws";
import * as validation from "@set-online/shared"
import { shuffleInPlace, countSets } from "@set-online/shared/utils.js";

const wsPort = 1515;
const wsUri = `ws://localhost:${wsPort}`
const server = new WebSocketServer({ port: wsPort });

const BOARD_START_SIZE = 12;
const NUM_CARDS = 81;

const rooms = new Map();

server.on('connection', (socket) => {
    const clientId = crypto.randomUUID();
    socket.send(JSON.stringify({ type: "new-client-created", clientId }));
    socket.send(JSON.stringify({ type: "lobbies-list", lobbies: Array.from(rooms.keys()) }));
    console.log("client", clientId, "connected")

    socket.on('message', (p) => {
        const payload = JSON.parse(p);

        switch (payload.type) {
            case "create-room": {
                const clientId = payload.clientId;
                if (!clientId) {
                    socket.send(JSON.stringify({ type: "error", message: "Need to specify client" }));
                    return;
                }
                const roomId = crypto.randomUUID();
                rooms.set(roomId, {
                    board: [],
                    remainingDeck: [],
                    clients: new Map()
                })
                rooms.get(roomId).clients.set(clientId, { name: clientId })
                console.log("room-created", roomId);
                socket.send(JSON.stringify({ type: "room-created", roomId }))
                broadcastToClients({ type: "lobbies-list", lobbies: Array.from(rooms.keys()) });
                break
            }
            case "join-room": {
                const clientId = payload.clientId;
                const roomId = payload.roomId;
                // const clientName = msg.name?.trim();
                if (!clientId) {
                    socket.send(JSON.stringify({ type: "error", message: "Need to specify client" }));
                    return;
                }
                if (!roomId || !rooms.has(roomId)) {
                    socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    return;
                }
                // if (!clientName) {
                //     socket.send(JSON.stringify({ type: "error", message: "Client name not found" }));
                //     socket.close();
                //     return;
                // }
                // rooms.get(roomId).clients.set(socket, { name: clientName, history: [] })
                rooms.get(roomId).clients.set(clientId, { name: clientId })
                socket.send(JSON.stringify({ type: "room-joined", roomId }))
                break
            }
            case "start-game": {
                const clientId = payload.clientId;
                const room = getClientRoom(clientId);
                if (!clientId) {
                    socket.send(JSON.stringify({ type: "error", message: "Need to specify client" }));
                    return;
                }
                if (!room) {
                    sendErrorMsg(socket, "Room not found")
                    return;
                }
                [room.board, room.remainingDeck] = generateBoard(room.board, room.remainingDeck)
                socket.send(JSON.stringify({ type: "board-update", board: room.board, isGameEnd: false }))
                break;
            }
            case "message": {
                const action = payload.action;
                const clientId = payload.clientId;
                console.log(Array.from(rooms.keys()))
                const room = getClientRoom(clientId);
                if (!action) {
                    sendErrorMsg(socket, "Need to specify action with message")
                    return;
                }
                if (!clientId) {
                    sendErrorMsg(socket, "Client not found")
                    return;
                }
                if (!room) {
                    sendErrorMsg(socket, "Room not found")
                    return;
                }

                switch (payload.action) {
                    case "board-update": {
                        const selectedCards = payload.cards;
                        console.log(`Received: ${selectedCards}`);
                        if (selectedCards.length !== 3) {
                            sendErrorMsg(socket, "Invalid number of cards")
                            return;
                        }
                        room.board = updateBoard(room.board, room.remainingDeck, selectedCards)
                        console.log(room.remainingDeck > 0)
                        console.log(room.board.length < BOARD_START_SIZE)
                        console.log(countSets(room.board))
                        console.log("sending msg to client...")
                        socket.send(JSON.stringify({
                            type: "board-update",
                            board: room.board,
                            isGameEnd: countSets(room.board) === 0 && room.remainingDeck.length === 0
                        }))
                    }
                }
                break
            }
        }
    });

    socket.on('close', () => {
        console.log("client", clientId, "disconnected")
    });
})

function getClientRoom(clientId) {
    for (const room of rooms.values()) {
        if (room.clients.has(clientId)) return room;
    }
    return null
}

function generateBoard(board, remainingDeck) {
    do {
        remainingDeck = Array.from({ length: NUM_CARDS }, (_, i) => i);
        shuffleInPlace(remainingDeck);
        // minor optimization to splice from back
        board = remainingDeck.splice(-BOARD_START_SIZE, BOARD_START_SIZE);
    } while (countSets(board) === 0);

    return [board, remainingDeck];
}

function updateBoard(board, remainingDeck, selectedCards) {
    if (selectedCards.length === 3 && validation.checkSet(...selectedCards)) {
        for (let i = 0; i < board.length; i++) {
            if (selectedCards.includes(board[i])) {
                if (board.length < BOARD_START_SIZE && remainingDeck.length > 0) {
                    board[i] = remainingDeck.pop();
                } else {
                    board.splice(i, 1);
                    i--;
                }
            }
        }
    }

    while (remainingDeck.length > 0 && (board.length < BOARD_START_SIZE || countSets(board) == 0)) {
        board.push(...remainingDeck.splice(-3));
    }

    return board
}

function sendErrorMsg(socket, message) {
    socket.send(JSON.stringify({ type: "error", message }));
    socket.close();
}

function broadcastToClients(payload) {
    for (const client of server.clients) {
        if (client.readyState === WebSocket.OPEN)
            client.send(JSON.stringify(payload))
    }
}
console.log('WebSocket server is running on', wsUri)