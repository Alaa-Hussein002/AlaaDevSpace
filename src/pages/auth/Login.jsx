import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code2, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, 
  AlertCircle, ShieldAlert, Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import { useState, useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  
  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // إعادة توجيه إذا كان مسجل دخول
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // التحقق من الحقول
  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // مسح الأخطاء السابقة
    setErrors({ email: '', password: '' });
    
    // التحقق من الحقول
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('🎉 مرحباً بك! تم تسجيل الدخول بنجاح', {
        duration: 3000,
      });
      
      // الانتقال بعد ثانية
      setTimeout(() => {
        if (result.user?.type === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1000);
    } else {
      // عرض رسائل الخطأ المخصصة
      const errorMessage = result.message || 'خطأ في تسجيل الدخول';
      
      if (errorMessage.includes('البريد') || errorMessage.includes('كلمة المرور') || errorMessage.includes('غير صحيح')) {
        toast.error(errorMessage, {
          icon: <ShieldAlert className="w-5 h-5" />,
          duration: 5000,
          description: 'تأكد من صحة بياناتك وحاول مرة أخرى',
        });
        // تمييز الحقول بالأحمر
        setErrors({ 
          email: 'تحقق من البريد الإلكتروني', 
          password: 'تحقق من كلمة المرور' 
        });
      } else if (errorMessage.includes('معطل')) {
        toast.error(errorMessage, {
          icon: <AlertCircle className="w-5 h-5" />,
          duration: 6000,
          description: 'للمزيد من المعلومات، تواصل مع الدعم الفني',
        });
      } else if (errorMessage.includes('تجاوز') || errorMessage.includes('محاولات')) {
        toast.error(errorMessage, {
          icon: <Clock className="w-5 h-5" />,
          duration: 7000,
          description: 'انتظر قليلاً ثم حاول مرة أخرى',
        });
      } else {
        toast.error(errorMessage, {
          duration: 5000,
        });
      }

      // مسح كلمة المرور
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" dir="rtl">
      {/* خلفية */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* اللوجو */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Alaa Hussein</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
          <p className="text-sm text-muted-foreground mt-1">مرحباً بعودتك!</p>
        </div>

        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* البريد */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  className={`pr-10 h-11 bg-background border-border text-left ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  dir="ltr"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* كلمة المرور */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  كلمة المرور
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                  tabIndex={-1}
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  className={`pr-10 pl-10 h-11 bg-background border-border text-left ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  dir="ltr"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* زر الدخول */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 gradient-bg text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الدخول...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          {/* رابط التسجيل - معطل مؤقتاً */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>التسجيل غير متاح حالياً - قريباً</span>
            </div>
          </div>
        </Card>

        {/* رابط العودة */}
        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← العودة للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}