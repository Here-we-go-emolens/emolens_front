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
import OAuthCallbackPage from './pages/OAuthCallback/OAuthCallbackPage.jsx';
import SignupPage from './pages/SignUp/SignupPage.jsx';
import LandingPage from './pages/Landing/LandingPage.jsx';
import './App.css'
import CommunityPage from './pages/Community/CommunityPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/"               element={<OnboardingPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      <Route path="/home"           element={<Home />} />
      <Route path="/community"      element={<CommunityPage />} />
      <Route path="/write"          element={<DiaryWritePage />} />
      <Route path="/ai-chat"        element={<AiDiaryChatPage />} />
      <Route path="/diary/:id"      element={<DiaryDetailPage />} />
      <Route path="/stats"          element={<StatsPage />} />
      <Route path="/settings"       element={<SettingsPage />} />
      <Route path="/premium"        element={<PremiumPage />} />
      <Route path="/signup"         element={<SignupPage />} />
    </Routes>
  )
}

export default App
