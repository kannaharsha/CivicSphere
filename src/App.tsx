import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './authentication/LoginPage'
import SignupPage from './authentication/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './firebase/ProtectedRoute'

import EligibilityStandalonePage from './pages/EligibilityStandalonePage'
import NotificationsStandalonePage from './pages/NotificationsStandalonePage'
import SettingsStandalonePage from './pages/SettingsStandalonePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/eligibility" element={
          <ProtectedRoute>
            <EligibilityStandalonePage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsStandalonePage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsStandalonePage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
