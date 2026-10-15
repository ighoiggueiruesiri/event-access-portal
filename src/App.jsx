import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AccessPortal from './AccessPortal';
import MenuPage from './MenuPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/access/error" replace />} />
        <Route path="/access/:guestName" element={<AccessPortal />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </Router>
  );
}