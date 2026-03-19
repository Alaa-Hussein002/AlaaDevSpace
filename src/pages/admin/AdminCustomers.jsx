import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Package, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminAPI } from '@/api/services';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getCustomers({ search }); setCustomers(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const viewCustomer = async (id) => {
    try { const { data } = await adminAPI.getCustomer(id); setSelected(data.data); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">العملاء</h1><p className="text-sm text-muted-foreground">{customers.length} عميل</p></div>
      </div>

      <Input placeholder="بحث بالاسم أو البريد..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} className="max-w-md h-10 bg-card" />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : customers.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا يوجد عملاء</p></Card>
      ) : (
        <div className="space-y-2">
          {customers.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 border-border/50 cursor-pointer hover:shadow-sm" onClick={() => viewCustomer(c.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{c.name?.[0]}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  <Badge variant="secondary" className={`text-[9px] ${c.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{c.status === 'active' ? 'نشط' : 'معطل'}</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>تفاصيل العميل</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{selected.customer?.name?.[0]}</div>
                <div><h3 className="font-bold">{selected.customer?.name}</h3><p className="text-sm text-muted-foreground">{selected.customer?.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 border-border/50 text-center"><Package className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-lg font-bold">{selected.stats?.total_orders || 0}</p><p className="text-[10px] text-muted-foreground">إجمالي الطلبات</p></Card>
                <Card className="p-3 border-border/50 text-center"><DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" /><p className="text-lg font-bold">${selected.stats?.total_spent || 0}</p><p className="text-[10px] text-muted-foreground">إجمالي الإنفاق</p></Card>
              </div>
              {(selected.orders || []).length > 0 && (
                <div><p className="font-bold text-sm mb-2">آخر الطلبات</p>
                  {selected.orders.slice(0, 5).map((o, i) => (
                    <div key={i} className="flex justify-between p-2 rounded-lg bg-muted/50 text-sm mb-1">
                      <span>{o.order_number}</span><span className="font-medium">${o.pricing?.total || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}