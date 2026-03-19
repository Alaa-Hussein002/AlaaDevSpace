import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
  });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password, form.password_confirmation);
    if (result.success) {
      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/');
    } else {
      toast.error(result.message);
      if (result.errors) {
        Object.values(result.errors).flat().forEach((err) => toast.error(err));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Alaa Systems</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="text-sm text-muted-foreground mt-1">انضم إلينا الآن</p>
        </div>

        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" name="name" placeholder="أدخل اسمك" value={form.name} onChange={handleChange} className="pr-10 h-11 bg-background" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="example@email.com" value={form.email} onChange={handleChange} className="pr-10 h-11 bg-background text-left" dir="ltr" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" name="phone" placeholder="+967 7X XXX XXXX" value={form.phone} onChange={handleChange} className="pr-10 h-11 bg-background text-left" dir="ltr" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" name="password" type={showPass ? 'text' : 'password'} placeholder="8 أحرف على الأقل" value={form.password} onChange={handleChange} className="pr-10 pl-10 h-11 bg-background text-left" dir="ltr" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password_confirmation" name="password_confirmation" type="password" placeholder="أعد كتابة كلمة المرور" value={form.password_confirmation} onChange={handleChange} className="pr-10 h-11 bg-background text-left" dir="ltr" required />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 gradient-bg text-white rounded-xl shadow-lg shadow-primary/25 mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}