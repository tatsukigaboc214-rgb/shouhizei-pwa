import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import QuestionMenu from './pages/QuestionMenu'
import PillarMode from './pages/PillarMode'
import BodyMode from './pages/BodyMode'
import AudioMode from './pages/AudioMode'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question/:id" element={<QuestionMenu />} />
        <Route path="/question/:id/pillar" element={<PillarMode />} />
        <Route path="/question/:id/body" element={<BodyMode />} />
        <Route path="/question/:id/audio" element={<AudioMode />} />
      </Routes>
    </BrowserRouter>
  )
}
