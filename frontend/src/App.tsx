import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RiderApp from './screens/RiderApp';
import DriverApp from './screens/DriverApp';
import AdminDashboardScreen from './screens/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/rider" replace />} />
        <Route path="/rider" element={<RiderApp />} />
        <Route path="/driver" element={<DriverApp />} />
        <Route path="/admin" element={<AdminDashboardScreen />} />
      </Routes>
    </Router>
  );
}

export default App;