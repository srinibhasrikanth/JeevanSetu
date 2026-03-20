import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import EmergencyQRScanner from './pages/EmergencyQRScanner';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import ActiveEmergency from './pages/ActiveEmergency';
import EventDetail from './pages/EventDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 font-sans">
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/qr/:qrCodeId" element={<EmergencyQRScanner />} />
            
            {/* ── Protected but allowed without complete profile ── */}
            <Route 
              path="/complete-profile" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <CompleteProfile />
                </ProtectedRoute>
              } 
            />

            {/* ── Protected core pages ── */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emergency" 
              element={
                <ProtectedRoute>
                  <ActiveEmergency />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event/:id" 
              element={
                <ProtectedRoute>
                  <EventDetail />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
