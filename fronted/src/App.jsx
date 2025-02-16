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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth/login" element={<AuthPage type="login" />} />
          <Route path="auth/register" element={<AuthPage type="register" />} />
          <Route path="votingpage" element={<VotingPage />} />
          <Route path="results" element={<ElectionResults />} />
          <Route path="createelection" element={<CreateElection />} />
          <Route path="OTP" element={<OTP />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="elections" element={<Elections />} />
          <Route path="admindashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
