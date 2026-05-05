import { Route, Routes } from 'react-router-dom';
import { UserProvider } from '@/contexts/UserContext';
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
import CharacterSetupPage from './pages/Character/CharacterSetupPage.jsx';
import LetterPage from './pages/Letter/LetterPage.jsx';
import './App.css'
import CommunityPage from './pages/Community/CommunityPage.jsx';
import CommunityPostDetailPage from './pages/Community/CommunityPostDetailPage.jsx';
import { CommunityProvider } from './pages/Community/CommunityContext.jsx';

function App() {
  return (
    <UserProvider>
    <CommunityProvider>
      <Routes>
        <Route path="/"               element={<OnboardingPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        <Route path="/home"           element={<Home />} />
        <Route path="/community"      element={<CommunityPage />} />
        <Route path="/community/:id"  element={<CommunityPostDetailPage />} />
        <Route path="/write"          element={<DiaryWritePage />} />
        <Route path="/ai-chat"        element={<AiDiaryChatPage />} />
        <Route path="/character"      element={<CharacterSetupPage />} />
        <Route path="/diary/:id"      element={<DiaryDetailPage />} />
        <Route path="/stats"          element={<StatsPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
        <Route path="/premium"        element={<PremiumPage />} />
        <Route path="/signup"         element={<SignupPage />} />
        <Route path="/letters"        element={<LetterPage />} />
      </Routes>
    </CommunityProvider>
    </UserProvider>
  )
}

export default App
