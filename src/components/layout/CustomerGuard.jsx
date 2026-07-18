import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

export default function CustomerGuard() {
  const { isAuthenticated, user, fetchUser, sessionChecked } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (!sessionChecked) {
        await fetchUser();
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
  if (!isAuthenticated) {
    toast.error('يجب تسجيل الدخول أولاً');
    return <Navigate to="/login" replace />;
  }

  // CUSTOMER_FEATURE: يمكن إضافة تحقق إضافي للعميل هنا
  // if (user?.type !== 'customer') {
  //   toast.error('هذه الصفحة مخصصة للعملاء فقط');
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
}