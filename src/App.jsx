import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import DiaryWritePage from './pages/CreateDiary/DiaryWritePage.jsx';
import AiDiaryChatPage from './pages/AiDiary/AiDiaryChatPage.jsx';
import DiaryDetailPage from './pages/DiaryDetail/DiaryDetailPage.jsx';
import StatsPage from './pages/Stats/StatsPage.jsx';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/write"      element={<DiaryWritePage />} />
      <Route path="/ai-chat"    element={<AiDiaryChatPage />} />
      <Route path="/diary/:id"  element={<DiaryDetailPage />} />
      <Route path="/stats"      element={<StatsPage />} />
    </Routes>
  )
}

export default App
