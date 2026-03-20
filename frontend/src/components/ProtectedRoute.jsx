import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';

/**
 * Wraps a route so only authenticated users can access it.
 * - While auth state is loading → show full-page spinner
 * - If not authenticated → redirect to landing page
 * - If authenticated but profileComplete is false → redirect to /complete-profile
 * - Otherwise → render children
 */
const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireProfile && user.profileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
