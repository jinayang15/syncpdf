import { useEffect, useState, useSyncExternalStore } from 'react'
import './Game.css'
import { connect, isAwaitingServerStore, sendSet, startGame } from './connect'
import boardStore from './boardStore.js';
import Card from './Card';
import cardImages from "./images.js"

// TODO: Add new screens and follow new server.js implementation
function Game() {
    const boardState = useSyncExternalStore(boardStore.subscribe, boardStore.getSnapshot);
    const [selectedCards, setSelectedCards] = useState([]);
    const isAwaitingServerState = useSyncExternalStore(isAwaitingServerStore.subscribe, isAwaitingServerStore.getSnapshot);

    useEffect(() => {
        connect();
        startGame();
    }, []);

    if (!isAwaitingServerState && selectedCards.length === 3) setSelectedCards([])

    function handleCardSelect(val) {
        console.log("selected card", val)
        if (isAwaitingServerState || selectedCards.includes(val)) return;

        if (selectedCards.length === 3) {
            setSelectedCards([])
        } else if (selectedCards.length === 2) {
            setSelectedCards(prev => [...prev, val])
            sendSet([...selectedCards, val])
        } else {
            setSelectedCards(prev => [...prev, val])
        }
    }

    return (
        <>
            <div id="board">
                {
                    boardState.board.map((val) => {
                        const selected = selectedCards.includes(val)
                        return (
                            <Card
                                key={val}
                                id={val}
                                img={cardImages[val]}
                                selected={selected}
                                handleCardSelect={() => handleCardSelect(val)}
                            />
                        )
                    })
                }
            </div>
            {boardState.isGameEnd && <div id="game-over">Game Over!</div>}
        </>
    )
}

export default Game
