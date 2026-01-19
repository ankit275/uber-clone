import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RiderApp from './screens/RiderApp';
import DriverApp from './screens/DriverApp';
import AdminDashboardScreen from './screens/AdminDashboard';
import LoginScreen from './screens/LoginScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import DriverRegistrationScreen from './screens/DriverRegistrationScreen';
import RideLiveTrackingPage from './screens/RideLiveTrackingPage';

// Protected route component
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/role-selection" element={
        user ? <RoleSelectionScreen /> : <Navigate to="/login" replace />
      } />
      <Route path="/register-driver" element={
        user ? <DriverRegistrationScreen /> : <Navigate to="/login" replace />
      } />
      <Route path="/rider" element={
        <ProtectedRoute>
          <RiderApp />
        </ProtectedRoute>
      } />
      <Route path="/ride/:rideId" element={
        <ProtectedRoute>
          <RideLiveTrackingPage />
        </ProtectedRoute>
      } />
      <Route path="/driver" element={
        <ProtectedRoute>
          <DriverApp />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboardScreen />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        user ? (user.driver ? <Navigate to="/driver" replace /> : <Navigate to="/rider" replace />) : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;