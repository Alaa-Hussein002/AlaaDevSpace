import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Code2, ShoppingBag, Gamepad2, FolderOpen, Mail, FileText, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import useFavoritesStore from '@/store/favoritesStore';

const navLinks = [
  { path: '/', label: 'الرئيسية', icon: Code2 },
  { path: '/projects', label: 'المشاريع', icon: FolderOpen },
  { path: '/blog', label: 'المقالات', icon: FileText },
  { path: '/store', label: 'المتجر', icon: ShoppingBag },
  { path: '/games', label: 'الألعاب', icon: Gamepad2 },
  { path: '/contact', label: 'تواصل', icon: Mail },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { cart } = useCartStore();
  const { favorites } = useFavoritesStore();
  const cartCount = cart?.items_count || 0;
  const favCount = favorites.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      useCartStore.getState().fetchCart();
    }
  }, [isAuthenticated]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">
              Alaa Systems
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 gradient-bg rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Link to="/favorites">
                  <Button variant="ghost" size="icon" className="rounded-lg relative">
                    <Heart className={`w-4 h-4 ${favCount > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                    {favCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">{favCount}</span>
                    )}
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="rounded-lg relative">
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[9px] text-white flex items-center justify-center">{cartCount}</span>
                    )}
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark(!dark)}
              className="rounded-lg"
            >
              <AnimatePresence mode="wait">
                {dark ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {isAuthenticated && user?.type === 'admin' ? (
              <Link to="/admin">
                <Button size="sm" className="gradient-bg text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  لوحة التحكم
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline" className="rounded-lg">
                  دخول
                </Button>
              </Link>
            )}

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'gradient-bg text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}