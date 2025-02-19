import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { Home } from './pages/Home';
import { Register } from './components/Register';
import UserDashboard from './pages/Dashboard';
import { Elections } from './pages/Elections';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import OTP from './pages/OTP';
import { CreateElection } from './pages/CreateElection';
import { ElectionResults } from './pages/electionResults';
import VotingPage from './pages/VotingPage';
import { ForgotPasswordPage } from './pages/PasswordReset';
import ProtectedRoute from './components/ProtectedRoutes'; // Import ProtectedRoute component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Pages */}
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="OTP" element={<OTP />} />
          <Route path="register" element={<Register />} />
          <Route index element={<Home />} />
          <Route path="auth/login" element={<AuthPage type="login" />} />
          <Route path="auth/register" element={<AuthPage type="register" />} />
          <Route path="votingpage" element={<VotingPage />} />
          <Route path="results" element={<ElectionResults />} />

          {/* Protected Routes */}
          <Route
            path="elections"
            element={
              <ProtectedRoute allowedRoles={['voter']}>
                <Elections />
              </ProtectedRoute>
            }
          />
          <Route
            path="createelection"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateElection />
              </ProtectedRoute>
            }
          />
          <Route
            path="elections"
            element={
              <ProtectedRoute allowedRoles={['voter', 'admin']}>
                <Elections />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['voter']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="admindashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
