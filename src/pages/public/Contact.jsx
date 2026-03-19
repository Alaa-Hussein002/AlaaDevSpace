import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { publicAPI } from '@/api/services';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicAPI.sendContact(form);
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ';
      toast.error(msg);
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((e) => toast.error(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <MessageSquare className="w-3 h-3 ml-1" />
            تواصل
          </Badge>
          <h1 className="text-4xl font-bold mb-3">
            تواصل <span className="gradient-text">معي</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            هل لديك مشروع أو فكرة؟ أرسل لي رسالة وسأرد عليك في أقرب وقت
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* معلومات التواصل */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            {[
              { icon: Mail, label: 'البريد', value: 'alaa@alaasystems.com', href: 'mailto:alaa@alaasystems.com' },
              { icon: Phone, label: 'الهاتف', value: '+967 77 123 4567', href: 'tel:+967771234567' },
              { icon: MapPin, label: 'الموقع', value: 'صنعاء، اليمن', href: null },
            ].map((info, i) => (
              <Card key={i} className="p-4 border-border/50 bg-card/80 card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} className="text-sm font-medium hover:text-primary transition-colors">{info.value}</a>
                    ) : (
                      <p className="text-sm font-medium">{info.value}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* روابط التواصل */}
            <Card className="p-4 border-border/50 bg-card/80">
              <p className="text-sm font-medium mb-3">تابعني على</p>
              <div className="flex gap-2">
                {[
                  { icon: Github, href: '#', label: 'GitHub' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                ].map((s, i) => (
                  <a key={i} href={s.href} className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" title={s.label}>
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* نموذج التواصل */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="p-6 border-border/50 bg-card/80 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم</Label>
                    <Input name="name" placeholder="اسمك الكامل" value={form.name} onChange={handleChange} className="h-11 bg-background" required />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input name="email" type="email" placeholder="example@email.com" value={form.email} onChange={handleChange} className="h-11 bg-background text-left" dir="ltr" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الهاتف (اختياري)</Label>
                    <Input name="phone" placeholder="+967" value={form.phone} onChange={handleChange} className="h-11 bg-background text-left" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>الموضوع</Label>
                    <Input name="subject" placeholder="موضوع الرسالة" value={form.subject} onChange={handleChange} className="h-11 bg-background" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الرسالة</Label>
                  <Textarea name="message" placeholder="اكتب رسالتك هنا..." value={form.message} onChange={handleChange} className="min-h-[140px] bg-background resize-none" required />
                </div>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto h-11 gradient-bg text-white rounded-xl px-8 shadow-lg shadow-primary/25">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                  {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}