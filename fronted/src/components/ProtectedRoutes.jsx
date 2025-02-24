import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import baseApi from '@/api/baseApi';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await baseApi.get("/config/get_user_session.php");

        console.log("API Response:", response.data); // Debugging

        if (response.data.role) {
          setRole(response.data.role);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Debugging outputs
  console.log("Current Role:", role);
  console.log("Allowed Roles:", allowedRoles);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!role) {
    return <Navigate to="/auth/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(`Access denied! Role "${role}" is not in allowed roles:`, allowedRoles);
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
