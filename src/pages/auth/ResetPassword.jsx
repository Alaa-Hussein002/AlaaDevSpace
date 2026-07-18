import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otp = location.state?.otp;

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { resetPassword, isLoading } = useAuthStore();

  // إعادة توجيه إذا لم تكن البيانات موجودة
  useEffect(() => {
    if (!email || !otp) {
      toast.error('جلسة غير صالحة. يرجى البدء من جديد');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, otp, navigate]);

  // حساب قوة كلمة المرور
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'ضعيفة';
    if (passwordStrength <= 3) return 'متوسطة';
    return 'قوية';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من طول كلمة المرور
    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    // التحقق من التطابق
    if (password !== passwordConfirmation) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }

    const result = await resetPassword(email, otp, password, passwordConfirmation);

    if (result.success) {
      toast.success(result.message);
      // الانتقال لصفحة تسجيل الدخول
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } else {
      toast.error(result.message);
      if (result.errors) {
        Object.values(result.errors).flat().forEach((err) => toast.error(err));
      }
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
          <h1 className="text-2xl font-bold text-foreground">إعادة تعيين كلمة المرور</h1>
          <p className="text-sm text-muted-foreground mt-1">اختر كلمة مرور قوية وآمنة</p>
        </div>

        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* البريد (للعرض فقط) */}
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="text-sm">
                <p className="text-muted-foreground">الحساب المحدد:</p>
                <p className="font-medium text-foreground" dir="ltr">{email}</p>
              </div>
            </div>

            {/* كلمة المرور الجديدة */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="8 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 h-11 bg-background border-border text-left"
                  dir="ltr"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* مؤشر قوة كلمة المرور */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    قوة كلمة المرور: <span className="font-medium">{getStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* تأكيد كلمة المرور */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm font-medium">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="أعد كتابة كلمة المرور"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="pr-10 pl-10 h-11 bg-background border-border text-left"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* مؤشر التطابق */}
              {passwordConfirmation && (
                <p className={`text-xs ${
                  password === passwordConfirmation 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {password === passwordConfirmation ? '✓ كلمة المرور متطابقة' : '✗ كلمة المرور غير متطابقة'}
                </p>
              )}
            </div>

            {/* نصائح الأمان */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
                نصائح لكلمة مرور قوية:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li className={password.length >= 8 ? 'line-through opacity-50' : ''}>
                  • 8 أحرف على الأقل
                </li>
                <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'line-through opacity-50' : ''}>
                  • أحرف كبيرة وصغيرة
                </li>
                <li className={/[0-9]/.test(password) ? 'line-through opacity-50' : ''}>
                  • أرقام
                </li>
                <li className={/[^a-zA-Z0-9]/.test(password) ? 'line-through opacity-50' : ''}>
                  • رموز خاصة (!@#$%...)
                </li>
              </ul>
            </div>

            {/* زر الحفظ */}
            <Button
              type="submit"
              disabled={isLoading || password.length < 8 || password !== passwordConfirmation}
              className="w-full h-11 gradient-bg text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
              {isLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
            </Button>
          </form>
        </Card>

        {/* رابط تسجيل الدخول */}
        <div className="text-center mt-4">
          <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← العودة لتسجيل الدخول
          </Link>
        </div>
      </motion.div>
    </div>
  );
}