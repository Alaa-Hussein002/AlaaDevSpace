import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

export default function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, fetchUser, sessionChecked } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!sessionChecked) {
        const result = await fetchUser();
        
        // فقط إذا فشل التحقق نعرض رسالة
        if (!result.success) {
          setShouldRedirect(true);
        }
      }
      setChecking(false);
    };

    checkSession();
  }, [sessionChecked, fetchUser]);

  // شاشة التحميل
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  // غير مسجل دخول
  if (!isAuthenticated || shouldRedirect) {
    // عرض Toast فقط إذا لم يأتي من صفحة Logout
    const fromLogout = location.state?.fromLogout;
    
    if (!fromLogout) {
      toast.error('يجب تسجيل الدخول أولاً');
    }
    
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}