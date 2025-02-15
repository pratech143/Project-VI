import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Register } from './components/Register';
import { Dashboard } from './pages/Dashboard';
import { Elections } from './pages/Elections';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import OTP from './pages/OTP';

// Wrapper component for public routes
function PublicRoute({ children }) {
  return user ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <Router>
        <Layout>
          <Routes>
            <Route path="/auth/login" element={<AuthPage type="login" />} />
            <Route path="/auth/register" element={<AuthPage type="register" />} />
            <Route path="/" element={<Home />} />
            <Route path="/OTP" element={<OTP />} />
            <Route path="/register" element={<Register />}/>
            <Route  path="/dashboard"  element={<Dashboard />}/>
            <Route  path="/elections" element={  <Elections />  }  />
            <Route path="/admin"  element={<AdminDashboard />}/>
          </Routes>
        </Layout>
        <Toaster position="top-right" />
    </Router>
  );
}

export default App;