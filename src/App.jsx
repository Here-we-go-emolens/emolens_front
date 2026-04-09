import { Navigate, Route, Routes } from 'react-router-dom';
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
import { isLoggedIn } from './services/auth.js';
import './App.css'

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/"               element={<LandingPage />} />
      <Route path="/onboarding"     element={<OnboardingPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      <Route path="/home"           element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/write"          element={<PrivateRoute><DiaryWritePage /></PrivateRoute>} />
      <Route path="/ai-chat"        element={<PrivateRoute><AiDiaryChatPage /></PrivateRoute>} />
      <Route path="/diary/:id"      element={<PrivateRoute><DiaryDetailPage /></PrivateRoute>} />
      <Route path="/stats"          element={<PrivateRoute><StatsPage /></PrivateRoute>} />
      <Route path="/settings"       element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/premium"        element={<PrivateRoute><PremiumPage /></PrivateRoute>} />
      <Route path="/signup"         element={<PrivateRoute><SignupPage /></PrivateRoute>} />
    </Routes>
  )
}

export default App
