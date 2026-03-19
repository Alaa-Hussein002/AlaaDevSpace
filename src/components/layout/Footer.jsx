import { Link } from 'react-router-dom';
import { Code2, Heart, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
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
              <span className="font-bold text-lg">Alaa Systems Hub</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              مهندس نظم معلومات شغوف بتطوير حلول تقنية متكاملة بواجهات تفاعلية حديثة.
              أبني أنظمة ويب وموبايل باستخدام أحدث التقنيات.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: Github, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              {[
                { label: 'المشاريع', path: '/projects' },
                { label: 'المتجر الرقمي', path: '/store' },
                { label: 'صالة الألعاب', path: '/games' },
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

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-4">تواصل</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 alaa@alaasystems.com</p>
              <p>📱 +967 77 123 4567</p>
              <p>📍 صنعاء، اليمن</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alaa Systems Hub. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            صُنع بـ <Heart className="w-3 h-3 text-red-500 fill-red-500" /> بواسطة علاء حسين
          </p>
        </div>
      </div>
    </footer>
  );
}