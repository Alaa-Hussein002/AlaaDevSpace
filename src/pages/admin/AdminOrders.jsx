import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

const statusLabel = { pending: 'معلق', confirmed: 'مؤكد', processing: 'قيد المعالجة', shipped: 'تم الشحن', delivered: 'تم التوصيل', completed: 'مكتمل', cancelled: 'ملغي' };
const statusColor = { pending: 'bg-yellow-500', confirmed: 'bg-blue-500', processing: 'bg-purple-500', completed: 'bg-green-500', cancelled: 'bg-red-500' };
const paymentLabel = { pending: 'معلق', paid: 'مدفوع', failed: 'فشل' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getOrders(); setOrders(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateStatus = async (orderNumber, status) => {
    try {
      await adminAPI.updateOrderStatus(orderNumber, { status, note: `تم تحديث الحالة إلى ${statusLabel[status]}` });
      toast.success('تم تحديث الحالة');
      setSelected(null); load();
    } catch (e) { toast.error('فشل التحديث'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold">إدارة الطلبات</h1>
        <p className="text-sm text-muted-foreground">{orders.length} طلب</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد طلبات</p></Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50 cursor-pointer hover:shadow-sm" onClick={() => setSelected(order)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{order.order_number}</span>
                      <Badge className={`${statusColor[order.order_status] || 'bg-gray-500'} text-white border-0 text-[9px]`}>{statusLabel[order.order_status]}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{paymentLabel[order.payment_status]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.customer_info?.name} — {order.items?.length || 0} منتج</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="font-bold">${order.pricing?.total || 0}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.created_at).toLocaleDateString('ar')}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>طلب {selected?.order_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">العميل:</span> <span className="font-medium">{selected.customer_info?.name}</span></div>
                <div><span className="text-muted-foreground">البريد:</span> <span className="font-medium">{selected.customer_info?.email}</span></div>
                <div><span className="text-muted-foreground">الدفع:</span> <span className="font-medium">{selected.payment_method}</span></div>
                <div><span className="text-muted-foreground">المجموع:</span> <span className="font-bold text-primary">${selected.pricing?.total}</span></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">المنتجات:</p>
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between p-2 rounded-lg bg-muted/50 text-sm">
                    <span>{item.product_name?.ar || item.product_name}</span>
                    <span className="font-medium">${item.total_price} × {item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">تحديث الحالة:</p>
                <div className="flex flex-wrap gap-2">
                  {['confirmed', 'processing', 'completed', 'cancelled'].map(s => (
                    <Button key={s} size="sm" variant={selected.order_status === s ? 'default' : 'outline'} className="text-xs rounded-lg" onClick={() => updateStatus(selected.order_number, s)} disabled={selected.order_status === s}>
                      {statusLabel[s]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}