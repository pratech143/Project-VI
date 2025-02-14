import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './pages/Dashboard';
import { Elections } from './pages/Elections';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';

// Wrapper component for public routes
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
          <Route path="/auth/login" element={<AuthPage type="login" />} />
        <Route path="/auth/register" element={<AuthPage type="register" />} />
      
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elections"
              element={
                <ProtectedRoute>
                  <Elections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;