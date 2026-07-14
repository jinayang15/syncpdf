import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router"
import './index.css'
import Home from './Home.jsx'
import Lobby from './Lobby.jsx'
import Game from './Game.jsx'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
