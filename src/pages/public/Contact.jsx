import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, Github, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { publicAPI } from '@/api/services';
import { SkeletonContactSection } from '@/components/SkeletonLoader';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';

// قائمة مفاتيح الدول
const COUNTRY_CODES = [
  { code: '+967', country: 'اليمن 🇾🇪' },
  { code: '+966', country: 'السعودية 🇸🇦' },
  { code: '+971', country: 'الإمارات 🇦🇪' },
  { code: '+970', country: 'فلسطين 🇵🇸' },
  { code: '+212', country: 'المغرب 🇲🇦' },
  { code: '+213', country: 'الجزائر 🇩🇿' },
  { code: '+216', country: 'تونس 🇹🇳' },
  { code: '+218', country: 'ليبيا 🇱🇾' },
  { code: '+20', country: 'مصر 🇪🇬' },
  { code: '+974', country: 'قطر 🇶🇦' },
  { code: '+965', country: 'الكويت 🇰🇼' },
  { code: '+973', country: 'البحرين 🇧🇭' },
  { code: '+968', country: 'عمان 🇴🇲' },
  { code: '+962', country: 'الأردن 🇯🇴' },
  { code: '+961', country: 'لبنان 🇱🇧' },
  { code: '+963', country: 'سوريا 🇸🇾' },
];

export default function Contact() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    countryCode: '+967',
    phone: '', 
    subject: '', 
    message: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { seoData, loading: seoLoading } = useSEO();

  // تحميل بيانات الملف الشخصي
  useEffect(() => {
    const controller = new AbortController();
    
    const loadProfile = async () => {
      try {
        // تعيين timeout لتسريع الاستجابة
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثواني
        
        const { data } = await publicAPI.getProfile();
        clearTimeout(timeoutId);
        
        setProfile(data.data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Profile loading timeout');
          toast.error('استغرق تحميل البيانات وقتاً طويلاً');
        } else {
          console.error('Error loading profile:', error);
          toast.error('حدث خطأ في تحميل البيانات');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    return () => controller.abort();
  }, []);

  // استخراج البيانات من الملف الشخصي
  const email = profile?.contact?.email;
  const phone = profile?.contact?.phone;
  const whatsapp = profile?.contact?.whatsapp;
  const socialLinks = profile?.social_links || [];

  // إعداد بيانات التواصل الديناميكية
  const contactInfo = [
    { icon: Mail, label: 'البريد', value: email, href: email ? `mailto:${email}` : null },
    { icon: Phone, label: 'الهاتف', value: phone, href: phone ? `tel:${phone}` : null },
    { icon: MessageSquare, label: 'واتساب', value: whatsapp, href: whatsapp ? `https://wa.me/${whatsapp.replace(/[+\s-]/g, '')}` : null },
  ].filter(item => item.value);

  // دالة للحصول على أيقونة الشبكة الاجتماعية
  const getSocialIcon = (platform, icon) => {
    // إذا كان هناك صورة أيقونة من البيانات، استخدمها
    if (icon) {
      return (
        <img 
          src={icon} 
          alt={platform}
          className="w-5 h-5 object-contain"
        />
      );
    }

    // وإلا استخدم الأيقونات الافتراضية
    switch (platform?.toLowerCase()) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (e) => {
    setForm(prev => ({ ...prev, countryCode: e.target.value }));
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s|-/g, '');
    return /^\d{7,12}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhone(form.phone)) {
      toast.error('رقم الهاتف غير صحيح. يجب أن يحتوي على 7-12 رقم');
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = `${form.countryCode}${form.phone.replace(/\s|-/g, '')}`;
      
      const submitData = {
        name: form.name,
        email: form.email,
        phone: fullPhone,
        subject: form.subject,
        message: form.message,
      };

      await publicAPI.sendContact(submitData);
      
      toast.success('✅ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
      setSubmitted(true);
      
      setTimeout(() => {
        setForm({ name: '', email: '', countryCode: '+967', phone: '', subject: '', message: '' });
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إرسال الرسالة';
      toast.error(msg);
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((e) => toast.error(e));
      }
    } finally {
      setSubmitting(false);
    }
  };

return (
  <>
      {/* ✅ إضافة SEO */}
      {!seoLoading && seoData && (
        <SEO
          title={`تواصل معي - ${seoData.title}`}
          description="هل لديك مشروع أو فكرة؟ تواصل معي الآن عبر البريد الإلكتروني أو واتساب"
          keywords={`تواصل, اتصال, ${seoData.keywords}, contact`}
          ogImage={seoData.photo}
          ogType="website"
        />
      )}
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
          {loading ? (
            // Skeleton Loading
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
            >
              <SkeletonContactSection />
            </motion.div>
          ) : (
            // البيانات الفعلية
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }} 
              className="space-y-4"
            >
              {/* بطاقات التواصل */}
              {contactInfo.map((info, i) => (
                <Card key={i} className="p-4 border-border/50 bg-card/80 card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* روابط التواصل الاجتماعية */}
              {socialLinks.length > 0 && (
                <Card className="p-4 border-border/50 bg-card/80">
                  <p className="text-sm font-medium mb-3">تابعني على</p>
                  <div className="flex gap-2 flex-wrap">
                    {socialLinks.map((social, i) => {
                      const isValidUrl = social.url && (social.url.startsWith('http') || social.url.startsWith('www') || social.url.startsWith('mailto'));
                      
                      return (
                        <a
                          key={i}
                          href={isValidUrl ? social.url : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                          title={social.platform}
                        >
                          {getSocialIcon(social.platform, social.icon)}
                        </a>
                      );
                    })}
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* نموذج التواصل */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="p-6 border-border/50 bg-card/80 shadow-xl">
              {submitted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4"
                  >
                    <Send className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">شكراً لك! 🎉</h2>
                  <p className="text-muted-foreground">تم إرسال رسالتك بنجاح. سنتواصل معك قريباً عبر البريد أو واتساب</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الاسم *</Label>
                      <Input 
                        name="name" 
                        placeholder="اسمك الكامل" 
                        value={form.name} 
                        onChange={handleChange} 
                        className="h-11 bg-background" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني *</Label>
                      <Input 
                        name="email" 
                        type="email" 
                        placeholder="example@email.com" 
                        value={form.email} 
                        onChange={handleChange} 
                        className="h-11 bg-background text-left" 
                        dir="ltr" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>رقم واتساب *</Label>
                    <div className="flex gap-2">
                      <select
                        value={form.countryCode}
                        onChange={handleCountryCodeChange}
                        className="h-11 px-3 rounded-lg bg-background border border-input text-sm font-medium min-w-fit"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.country} {c.code}
                          </option>
                        ))}
                      </select>
                      <Input 
                        name="phone" 
                        type="tel"
                        placeholder="77123456" 
                        value={form.phone} 
                        onChange={handleChange} 
                        className="h-11 bg-background text-left flex-1" 
                        dir="ltr"
                        maxLength="12"
                        inputMode="numeric"
                        required 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">أدخل الرقم بدون المفتاح الدولي</p>
                  </div>

                  <div className="space-y-2">
                    <Label>الموضوع *</Label>
                    <Input 
                      name="subject" 
                      placeholder="موضوع الرسالة" 
                      value={form.subject} 
                      onChange={handleChange} 
                      className="h-11 bg-background" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الرسالة *</Label>
                    <Textarea 
                      name="message" 
                      placeholder="اكتب رسالتك هنا..." 
                      value={form.message} 
                      onChange={handleChange} 
                      className="min-h-[140px] bg-background resize-none" 
                      required 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full sm:w-auto h-11 gradient-bg text-white rounded-xl px-8 shadow-lg shadow-primary/25"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                    {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  </>
  );
}