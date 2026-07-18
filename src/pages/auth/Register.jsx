import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Register() {
  const navigate = useNavigate();

  // CUSTOMER_FEATURE: Disabled temporarily
  // إعادة توجيه تلقائي إلى صفحة Login
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" dir="rtl">
      {/* خلفية */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />

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
        </div>

        <Card className="p-8 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">التسجيل غير متاح مؤقتاً</h1>
          
          <p className="text-muted-foreground mb-6">
            نعمل حالياً على تطوير نظام التسجيل للعملاء.<br />
            سيتم تفعيل التسجيل قريباً جداً.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-11 gradient-bg text-white rounded-xl shadow-lg"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              الذهاب لتسجيل الدخول
            </Button>

            <Link to="/" className="block">
              <Button variant="outline" className="w-full h-11">
                العودة للرئيسية
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            سيتم توجيهك تلقائياً لصفحة تسجيل الدخول خلال 5 ثوانٍ...
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

/* 
// ===== CUSTOMER_FEATURE: Original Register Code =====
// سيتم تفعيل هذا الكود لاحقاً

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
    // ... Original JSX
  );
}
*/