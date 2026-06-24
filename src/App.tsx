import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PillarMode from './pages/PillarMode'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question/:id" element={<PillarMode />} />
      </Routes>
    </BrowserRouter>
  )
}
