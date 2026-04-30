import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '@/src/pages/LandingPage';
import Dashboard from '@/src/pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}




