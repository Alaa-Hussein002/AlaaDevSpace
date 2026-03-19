import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح');
      if (result.user?.type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
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
            <span className="font-bold text-xl">Alaa Systems</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
          <p className="text-sm text-muted-foreground mt-1">مرحباً بعودتك!</p>
        </div>

        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 h-11 bg-background border-border text-left"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* زر الدخول */}
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
              {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          {/* رابط التسجيل */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
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