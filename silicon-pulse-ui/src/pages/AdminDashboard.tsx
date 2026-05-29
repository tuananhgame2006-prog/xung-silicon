import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { AdminLogin } from '../components/AdminLogin';

export const AdminDashboard = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  // If already logged in, redirect to home where in-place admin controls are available
  return <Navigate to="/" replace />;
};
