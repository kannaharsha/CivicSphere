import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './authentication/LoginPage'
import SignupPage from './authentication/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './firebase/ProtectedRoute'

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
      </Routes>
    </BrowserRouter>
  )
}
