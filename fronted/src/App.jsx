import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import { Home } from "./pages/Home";
import { Register } from "./components/Register";
import UserDashboard from "./pages/Dashboard";
import { Elections } from "./pages/Elections";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthPage } from "./pages/AuthPage";
import OTP from "./pages/OTP";
import { CreateElection } from "./pages/CreateElection";
import ElectionResults from "./pages/electionResults";
import VotingPage from "./pages/VotingPage";
import { ForgotPasswordPage } from "./pages/PasswordReset";
import ProtectedRoute from "./components/ProtectedRoutes"; // Import ProtectedRoute component
import { Profile } from "./pages/Profile";
import AddCandidates from "./components/AddCandidates";
import AdminVoterApproval from "./pages/ApproveVoters";
import ContactAdmin from "./pages/ContactAdmin";
import { useEffect, useState } from "react";
import RemoveVoter from "./pages/RemoveVoter";
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
         <Route path="contactus" element={<ContactAdmin />} />
          

          <Route path="results" element={<ElectionResults />} />

          {/* Protected Routes */}
          <Route
            path="elections"
            element={
              <ProtectedRoute allowedRoles={["voter"]}>
                <Elections />
              </ProtectedRoute>
            }
          />
          <Route
            path="approve-voters"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminVoterApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["voter"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="createelection"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateElection />
              </ProtectedRoute>
            }
          />
          <Route
            path="votingpage"
            element={
              <ProtectedRoute allowedRoles={["voter"]} restrictVoting={true}>
                <VotingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="addcandidates"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="elections"
            element={
              <ProtectedRoute allowedRoles={["voter", "admin"]}>
                <Elections />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["voter"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="removevoter"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RemoveVoter />
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
