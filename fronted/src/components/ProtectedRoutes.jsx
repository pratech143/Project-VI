// import { Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import baseApi from '@/api/baseApi';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const response = await baseApi.get("/config/get_user_session.php");

//         console.log("API Response:", response.data); // Debugging

//         if (response.data.role) {
//           setRole(response.data.role);
//         }
//       } catch (error) {
//         console.error("Error fetching session:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSession();
//   }, []);

//   // Debugging outputs
//   console.log("Current Role:", role);
//   console.log("Allowed Roles:", allowedRoles);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!role) {
//     return <Navigate to="/auth/login" />;
//   }

//   if (allowedRoles && !allowedRoles.includes(role)) {
//     console.warn(`Access denied! Role "${role}" is not in allowed roles:`, allowedRoles);
//     return <Navigate to="/" />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import baseApi from '@/api/baseApi';

const ProtectedRoute = ({ children, allowedRoles, restrictVoting = false }) => {
  const [role, setRole] = useState(null);
  const [isVoted, setIsVoted] = useState(null);
  const [verified, setVerified] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const votingConfirmation = async () => {
    try {
      const response = await baseApi.get("function/is_voted.php");
      setIsVoted(response.data.is_voted);
    } catch (error) {
      console.log(error);
    }
  };
  const verificationConfirmation = async () => {
    try {
      const response = await baseApi.get("function/is_verified.php");
      setVerified(response.data.is_verified);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    votingConfirmation();
    verificationConfirmation();
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await baseApi.get("/config/get_user_session.php");

        console.log("API Response:", response.data); // Debugging

        if (response.data) {
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
  console.log("Is Voted:", isVoted);
  console.log("Verified:", verified);
  console.log("Allowed Roles:", allowedRoles);
  console.log("Restrict Voting:", restrictVoting);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if no role (not authenticated)
  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect to home if role is not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(`Access denied! Role "${role}" is not in allowed roles:`, allowedRoles);
    return <Navigate to="/" replace />;
  }

  // Restrict VotingPage only: Redirect to root if user has voted or is not verified
  if (restrictVoting && (isVoted === 1 || verified === 0 || verified === -1)) {
    console.log("Redirecting to / due to voting/verification status");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;