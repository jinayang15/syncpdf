import { WebSocketServer, WebSocket } from "ws";
import * as validation from "@set-online/shared"
import { shuffleInPlace, countSets } from "@set-online/shared/utils.js";

const port = 1515;
const wsUri = `ws://localhost:${port}`
const server = new WebSocketServer({ port });

const BOARD_START_SIZE = 12;
const NUM_CARDS = 81;

const rooms = new Map();

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const msg = JSON.parse(message);

        switch (msg.type) {
            case "create-new-client": {
                const clientId = crypto.randomUUID();
                socket.send(JSON.stringify({ type: "new-client-created", clientId }))
            }
            case "create-room": {
                const clientId = msg.clientId;
                if (!clientId) {
                    socket.send(JSON.stringify({ type: "error", message: "Need to specify client" }));
                    socket.close();
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
                break
            }
            case "join-room": {
                const clientId = msg.clientId;
                const roomId = msg.roomId;
                // const clientName = msg.name?.trim();
                if (!clientId) {
                    socket.send(JSON.stringify({ type: "error", message: "Need to specify client" }));
                    socket.close();
                    return;
                }
                if (!roomId || !rooms.has(roomId)) {
                    socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    socket.close();
                    return;
                }
                // if (!clientName) {
                //     socket.send(JSON.stringify({ type: "error", message: "Client name not found" }));
                //     socket.close();
                //     return;
                // }
                // rooms.get(roomId).clients.set(socket, { name: clientName, history: [] })
                rooms.get(roomId).clients.set(clientId, { name: clientId })
                socket.send(JSON.stringify({ type: "" }))
                break
            }
            case "start-game": {
                const clientId = msg.clientId;
                const room = getClientRoom(clientId);
                if (!clientId) {
                    socket.send(JSON.stringify({ type: "error", message: "Need to specify client" }));
                    socket.close();
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
                const action = msg.action;
                const clientId = msg.clientId;
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

                switch (msg.action) {
                    case "board-update": {
                        const selectedCards = msg.cards;
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
        console.log('Client disconnected');
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
console.log('WebSocket server is running on', wsUri)

// TODO: Create an HTTP server to allow calls for joinable rooms