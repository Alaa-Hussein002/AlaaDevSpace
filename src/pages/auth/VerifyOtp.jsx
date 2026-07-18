import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 دقائق = 300 ثانية
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();

  // إعادة توجيه إذا لم يكن هناك بريد
  useEffect(() => {
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني أولاً');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Timer للعد التنازلي
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // التركيز على أول حقل عند التحميل
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // السماح بالأرقام فقط
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // آخر رقم فقط
    setOtp(newOtp);

    // الانتقال للحقل التالي تلقائياً
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // حذف والانتقال للحقل السابق
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error('الصق أرقام فقط');
      return;
    }

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    
    // التركيز على آخر حقل ممتلئ
    const lastFilledIndex = Math.min(newOtp.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('يرجى إدخال الرمز كاملاً');
      return;
    }

    const result = await verifyOtp(email, otpCode);

    if (result.success) {
      toast.success(result.message);
      // الانتقال لصفحة إعادة تعيين كلمة المرور
      navigate('/reset-password', {
        state: { email, otp: otpCode },
        replace: true
      });
    } else {
      toast.error(result.message);
      // مسح الحقول عند الخطأ
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    const result = await resendOtp(email);

    if (result.success) {
      toast.success(result.message);
      setTimer(300); // إعادة تعيين العداد
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      toast.error(result.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-2xl font-bold text-foreground">أدخل رمز التحقق</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تم إرسال رمز مكون من 6 أرقام إلى<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* حقول OTP */}
            <div className="flex justify-center gap-2" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-background disabled:opacity-50"
                />
              ))}
            </div>

            {/* العداد */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  ينتهي الرمز خلال{' '}
                  <span className="font-medium text-foreground">{formatTime(timer)}</span>
                </p>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>انتهت صلاحية الرمز</span>
                </div>
              )}
            </div>

            {/* زر التحقق */}
            <Button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-11 gradient-bg text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
              {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
            </Button>

            {/* زر إعادة الإرسال */}
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="w-full h-11"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة إرسال الرمز
            </Button>
          </form>

          {/* رابط العودة */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/forgot-password" className="text-primary font-medium hover:underline">
              ← تغيير البريد الإلكتروني
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}