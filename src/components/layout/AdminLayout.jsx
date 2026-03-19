import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, Sparkles, ShoppingBag, Package,
  CreditCard, Gamepad2, Users, Settings, Mail, LogOut,
  Menu, X, Bell, ChevronLeft, User, Briefcase, GraduationCap,
  Award, MessageSquareQuote, Ticket, Users2, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';

const sidebarLinks = [
  { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/profile', label: 'الملف الشخصي', icon: User },
  { path: '/admin/projects', label: 'المشاريع', icon: FolderOpen },
  { path: '/admin/skills', label: 'المهارات', icon: Sparkles },
  { path: '/admin/experiences', label: 'الخبرات', icon: Briefcase },
  { path: '/admin/educations', label: 'التعليم', icon: GraduationCap },
  { path: '/admin/certificates', label: 'الشهادات', icon: Award },
  { path: '/admin/testimonials', label: 'التوصيات', icon: MessageSquareQuote },
  { path: '/admin/articles', label: 'المقالات', icon: FileText },
  { path: '/admin/products', label: 'المنتجات', icon: ShoppingBag },
  { path: '/admin/orders', label: 'الطلبات', icon: Package },
  { path: '/admin/payments', label: 'المدفوعات', icon: CreditCard },
  { path: '/admin/coupons', label: 'الكوبونات', icon: Ticket },
  { path: '/admin/customers', label: 'العملاء', icon: Users },
  { path: '/admin/games', label: 'الألعاب', icon: Gamepad2 },
  { path: '/admin/messages', label: 'الرسائل', icon: Mail },
  { path: '/admin/users', label: 'المستخدمين', icon: Users2 },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-sm"
            >
              لوحة التحكم
            </motion.span>
          )}
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'gradient-bg text-white shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-border">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>تسجيل خروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 70 : 260 }}
        className="hidden lg:flex flex-col border-l border-border bg-card h-screen sticky top-0"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: 260 }}
              animate={{ x: 0 }}
              exit={{ x: 260 }}
              className="fixed right-0 top-0 bottom-0 w-[260px] bg-card border-l border-border z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-sm font-medium text-muted-foreground">
              {sidebarLinks.find(l => l.path === location.pathname)?.label || 'لوحة التحكم'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                عرض الموقع
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}