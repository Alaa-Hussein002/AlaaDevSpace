import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function AuthGuard() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}