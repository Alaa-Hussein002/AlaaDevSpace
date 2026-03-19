import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { customerAPI } from '@/api/services';

const statusLabel = { pending: 'معلق', confirmed: 'مؤكد', processing: 'قيد المعالجة', completed: 'مكتمل', cancelled: 'ملغي' };
const statusColor = { pending: 'bg-yellow-500/10 text-yellow-600', confirmed: 'bg-blue-500/10 text-blue-600', completed: 'bg-green-500/10 text-green-600', cancelled: 'bg-red-500/10 text-red-600' };
const paymentLabel = { pending: 'بانتظار الدفع', paid: 'مدفوع', failed: 'فشل' };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await customerAPI.getOrders(); setOrders(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const cancelOrder = async (orderNumber) => {
    if (!confirm('هل تريد إلغاء الطلب؟')) return;
    try { await customerAPI.cancelOrder(orderNumber); toast.success('تم إلغاء الطلب'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'لا يمكن الإلغاء'); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> طلباتي</h1>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">لا توجد طلبات بعد</p>
            <Link to="/store"><Button variant="outline" className="rounded-xl mt-2">تصفح المتجر</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm">{order.order_number}</span>
                        <Badge className={`text-[9px] border-0 ${statusColor[order.order_status] || ''}`}>{statusLabel[order.order_status] || order.order_status}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{paymentLabel[order.payment_status] || order.payment_status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <p className="text-xl font-bold text-primary">${order.pricing?.total || 0}</p>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {(order.items || []).map((item, j) => (
                      <div key={j} className="flex justify-between text-sm p-2 rounded-lg bg-muted/30">
                        <span className="text-muted-foreground">{item.product_name?.ar || item.product_name} ×{item.quantity}</span>
                        <span>${item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/my-orders/${order.order_number}`}>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs"><Eye className="w-3 h-3 ml-1" /> التفاصيل</Button>
                    </Link>
                    {order.payment_status === 'pending' && (
                      <Link to={`/my-orders/${order.order_number}/pay`}>
                        <Button size="sm" className="gradient-bg text-white rounded-lg text-xs">إرسال إثبات الدفع</Button>
                      </Link>
                    )}
                    {['pending', 'confirmed'].includes(order.order_status) && (
                      <Button variant="ghost" size="sm" className="text-red-500 text-xs rounded-lg" onClick={() => cancelOrder(order.order_number)}>
                        <XCircle className="w-3 h-3 ml-1" /> إلغاء
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}