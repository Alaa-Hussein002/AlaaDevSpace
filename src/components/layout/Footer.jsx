import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Code2, Heart, Mail, Phone, MessageCircle } from 'lucide-react';
import { publicAPI } from '@/api/services';

export default function Footer() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await publicAPI.getProfile();
        setProfile(data.data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // استخراج البيانات
  const bio = profile?.bio?.ar || 'مهندس نظم معلومات شغوف بتطوير حلول تقنية متكاملة';
  const name = profile?.full_name?.ar || 'Alaa Hussein';
  const email = profile?.contact?.email;
  const phone = profile?.contact?.phone;
  const whatsapp = profile?.contact?.whatsapp;
  const socialLinks = profile?.social_links || [];

  // دالة لفتح واتساب
  const openWhatsApp = () => {
    if (!whatsapp) return;
    const cleanNumber = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">{name}</span>
            </Link>
            
            {loading ? (
              <div className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                {bio}
              </p>
            )}

            {/* Social Links - محسّنة ومُبرَزة */}
            {!loading && socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6 flex-wrap">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:scale-110 transition-all duration-300 group relative overflow-hidden"
                    title={social.platform}
                  >
                    {/* تأثير Glow عند الـ Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:to-primary/5 transition-all duration-300" />
                    
                    {social.icon ? (
                      <img 
                        src={social.icon} 
                        alt={social.platform}
                        className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity relative z-10"
                      />
                    ) : (
                      <span className="text-sm font-bold relative z-10">
                        {social.platform?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              {[
                { label: 'الرئيسية', path: '/' },
                { label: 'المشاريع', path: '/projects' },
                { label: 'المقالات', path: '/blog' },
                { label: 'تواصل معي', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact - من اليمين إلى اليسار (عربي) */}
          <div className="text-right" dir="rtl">
            <h3 className="font-semibold text-sm mb-4">تواصل</h3>
            {loading ? (
              <div className="space-y-2">
                <div className="h-5 bg-muted/30 rounded animate-pulse" />
                <div className="h-5 bg-muted/30 rounded animate-pulse w-3/4 mr-auto" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* البريد الإلكتروني */}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="truncate group-hover:underline">{email}</span>
                  </a>
                )}
          
                {/* رقم الهاتف */}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="group-hover:underline" dir="ltr">{phone}</span>
                  </a>
                )}
          
                {/* واتساب */}
                {whatsapp && (
                  <button
                    onClick={openWhatsApp}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors group w-full"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="group-hover:underline" dir="ltr">{whatsapp}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {name}. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            صُنع بـ <Heart className="w-3 h-3 text-red-500 fill-red-500" /> بواسطة {name}
          </p>
        </div>
      </div>
    </footer>
  );
}