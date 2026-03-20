import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ActiveEmergency from './pages/ActiveEmergency';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/emergency" element={<ActiveEmergency />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
