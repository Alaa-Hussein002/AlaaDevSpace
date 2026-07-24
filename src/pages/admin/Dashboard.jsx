import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, CreditCard, Users, ShoppingBag, Gamepad2,
  Mail, TrendingUp, Eye, ArrowUpRight, Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/api/services';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-5 border-border/50 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  // const loadDashboard = async () => {
  //   try {
  //     const { data: res } = await adminAPI.getDashboard();
  //     setData(res.data);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="h-80 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const visitStats = data?.visit_stats || [];

  const statusLabel = {
    pending: 'معلق',
    confirmed: 'مؤكد',
    processing: 'قيد المعالجة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };
  const paymentLabel = {
    pending: 'معلق',
    paid: 'مدفوع',
    pending_confirmation: 'بانتظار التأكيد',
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* البطاقات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="إجمالي الطلبات" value={stats.total_orders} color="bg-blue-500" delay={0} />
        <StatCard icon={TrendingUp} label="الإيرادات ($)" value={stats.total_revenue?.toFixed(2) || '0.00'} color="bg-green-500" delay={0.05} />
        <StatCard icon={Users} label="العملاء" value={stats.total_customers} color="bg-purple-500" delay={0.1} />
        <StatCard icon={CreditCard} label="مدفوعات معلقة" value={stats.pending_payments} color="bg-orange-500" delay={0.15} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="المنتجات" value={stats.total_products} color="bg-cyan-500" delay={0.2} />
        <StatCard icon={Gamepad2} label="الألعاب" value={stats.total_games} color="bg-red-500" delay={0.25} />
        <StatCard icon={Eye} label="مرات اللعب" value={stats.total_game_plays} color="bg-indigo-500" delay={0.3} />
        <StatCard icon={Mail} label="رسائل غير مقروءة" value={stats.unread_messages} color="bg-pink-500" delay={0.35} />
      </div>

      {/* الرسم البياني + آخر الطلبات */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* الرسم البياني */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-5 border-border/50">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              زيارات آخر 7 أيام
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitStats}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorVisits)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* آخر الطلبات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="p-5 border-border/50 h-full">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              آخر الطلبات
            </h3>
            <div className="space-y-3">
              {(data?.recent_orders || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد طلبات بعد</p>
              ) : (
                data.recent_orders.map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-[10px] text-muted-foreground">{order.order_number}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">${order.total}</p>
                      <Badge variant="secondary" className="text-[9px]">
                        {statusLabel[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}