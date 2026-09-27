import { Routes, Route, Navigate } from 'react-router-dom'
import Topbar from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import VoterRegisterPage from './pages/VoterRegisterPage'
import PartyRegisterPage from './pages/PartyRegisterPage'
import ElectionsPage from './pages/ElectionsPage'
import ElectionDetailPage from './pages/ElectionDetailPage'
import PartyDashboard from './pages/PartyDashboard'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <div className="app-shell">
      <Topbar />
      <Routes>
        <Route path="/" element={<Navigate to="/elections" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/voter" element={<VoterRegisterPage />} />
        <Route path="/register/party" element={<PartyRegisterPage />} />
        <Route path="/elections" element={<ElectionsPage />} />
        <Route path="/elections/:id" element={<ElectionDetailPage />} />
        <Route
          path="/party"
          element={
            <ProtectedRoute role="PARTY">
              <PartyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
