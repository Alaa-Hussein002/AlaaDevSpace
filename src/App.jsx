import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/layout/AuthGuard';

// Public Pages
import Home from '@/pages/public/Home';
import Projects from '@/pages/public/Projects';
import ProjectDetails from '@/pages/public/ProjectDetails';
import Store from '@/pages/public/Store';
import ProductDetails from '@/pages/public/ProductDetails';
import Games from '@/pages/public/Games';
import Contact from '@/pages/public/Contact';
import Articles from '@/pages/public/Articles';
import ArticleDetails from '@/pages/public/ArticleDetails';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Customer Pages
import CustomerCart from '@/pages/customer/CustomerCart';
import Checkout from '@/pages/customer/Checkout';
import MyOrders from '@/pages/customer/MyOrders';
import Favorites from '@/pages/customer/Favorites';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import AdminProfile from '@/pages/admin/AdminProfile';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminSkills from '@/pages/admin/AdminSkills';
import AdminExperiences from '@/pages/admin/AdminExperiences';
import AdminEducations from '@/pages/admin/AdminEducations';
import AdminCertificates from '@/pages/admin/AdminCertificates';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminGames from '@/pages/admin/AdminGames';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminArticles from '@/pages/admin/AdminArticles';
import ArticleEditor from '@/pages/admin/ArticleEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetails />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/:slug" element={<ProductDetails />} />
          <Route path="/games" element={<Games />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Articles />} />
          <Route path="/blog/:slug" element={<ArticleDetails />} />

          {/* Customer Routes */}
          <Route path="/cart" element={<CustomerCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/skills" element={<AdminSkills />} />
            <Route path="/admin/experiences" element={<AdminExperiences />} />
            <Route path="/admin/educations" element={<AdminEducations />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/games" element={<AdminGames />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/articles/new" element={<ArticleEditor />} />
            <Route path="/admin/articles/:id/edit" element={<ArticleEditor />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;