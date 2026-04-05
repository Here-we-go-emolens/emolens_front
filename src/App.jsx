import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import DiaryWritePage from './pages/CreateDiary/DiaryWritePage.jsx';
import AiDiaryChatPage from './pages/AiDiary/AiDiaryChatPage.jsx';
import DiaryDetailPage from './pages/DiaryDetail/DiaryDetailPage.jsx';
import StatsPage from './pages/Stats/StatsPage.jsx';
import SettingsPage from './pages/Settings/SettingsPage.jsx';
import OnboardingPage from './pages/Onboarding/OnboardingPage.jsx';
import PremiumPage from './pages/Premium/PremiumPage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/"           element={<OnboardingPage />} />
      <Route path="/home"       element={<Home />} />
      <Route path="/write"      element={<DiaryWritePage />} />
      <Route path="/ai-chat"    element={<AiDiaryChatPage />} />
      <Route path="/diary/:id"  element={<DiaryDetailPage />} />
      <Route path="/stats"      element={<StatsPage />} />
      <Route path="/settings"   element={<SettingsPage />} />
      <Route path="/premium"    element={<PremiumPage />} />
      <Route path="/login"      element={<LoginPage />} />
    </Routes>
  )
}

export default App
