import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role'); // Check if a role exists

  // If there's no role, the user is not authenticated
  if (!role) {
    return <Navigate to="/auth/login" />;
  }

  // If the user's role is not in the allowedRoles array, redirect to the home page
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
