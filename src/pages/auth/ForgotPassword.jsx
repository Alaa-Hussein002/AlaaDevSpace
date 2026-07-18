import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }

    const result = await forgotPassword(email);

    if (result.success) {
      toast.success(result.message);
      // الانتقال لصفحة إدخال OTP مع تمرير البريد
      navigate('/verify-otp', { 
        state: { email },
        replace: true 
      });
    } else {
      toast.error(result.message);
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
          <h1 className="text-2xl font-bold text-foreground">نسيت كلمة المرور؟</h1>
          <p className="text-sm text-muted-foreground mt-1">سنرسل لك رمز تحقق لإعادة تعيينها</p>
        </div>

        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* تعليمات */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">كيف يعمل هذا؟</p>
                <p className="text-xs">سنرسل رمز مكون من 6 أرقام إلى بريدك الإلكتروني. استخدمه لإعادة تعيين كلمة المرور.</p>
              </div>
            </div>

            {/* البريد */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 h-11 bg-background border-border text-left"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* زر الإرسال */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 gradient-bg text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
              {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </Button>
          </form>

          {/* رابط العودة */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            تذكرت كلمة المرور؟{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </Card>

        {/* رابط الرئيسية */}
        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← العودة للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}