import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, X, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

const statusLabel = { pending_confirmation: 'بانتظار التأكيد', confirmed: 'مؤكد', rejected: 'مرفوض' };
const statusColor = { pending_confirmation: 'bg-yellow-500', confirmed: 'bg-green-500', rejected: 'bg-red-500' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getPayments(); setPayments(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const confirmPayment = async (num) => {
    try { await adminAPI.confirmPayment(num, {}); toast.success('تم تأكيد الدفعة'); setSelected(null); load(); }
    catch (e) { toast.error('فشل'); }
  };

  const rejectPayment = async (num) => {
    if (!rejectReason) return toast.error('سبب الرفض مطلوب');
    try { await adminAPI.rejectPayment(num, { reason: rejectReason }); toast.success('تم الرفض'); setSelected(null); load(); }
    catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold">إدارة المدفوعات</h1>
        <p className="text-sm text-muted-foreground">{payments.filter(p => p.status === 'pending_confirmation').length} بانتظار التأكيد</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : payments.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد مدفوعات</p></Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50 cursor-pointer hover:shadow-sm" onClick={() => { setSelected(p); setRejectReason(''); }}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.status === 'pending_confirmation' ? 'bg-yellow-500/10' : 'bg-muted'}`}>
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{p.payment_number}</span>
                      <Badge className={`${statusColor[p.status]} text-white border-0 text-[9px]`}>{statusLabel[p.status]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.payment_method} — <Clock className="w-3 h-3 inline" /> {new Date(p.created_at).toLocaleDateString('ar')}</p>
                  </div>
                  <p className="font-bold text-lg">${p.amount}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>دفعة {selected?.payment_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">المبلغ:</span> <span className="font-bold text-primary text-lg">${selected.amount}</span></div>
                <div><span className="text-muted-foreground">الطريقة:</span> <span className="font-medium">{selected.payment_method}</span></div>
              </div>
              {selected.payment_details && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                  {selected.payment_details.bank_name && <p>البنك: {selected.payment_details.bank_name}</p>}
                  {selected.payment_details.transfer_reference && <p>مرجع: {selected.payment_details.transfer_reference}</p>}
                  {selected.payment_details.wallet_provider && <p>المحفظة: {selected.payment_details.wallet_provider}</p>}
                </div>
              )}
              {selected.status === 'pending_confirmation' && (
                <div className="space-y-3">
                  <Button onClick={() => confirmPayment(selected.payment_number)} className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl">
                    <Check className="w-4 h-4 ml-2" /> تأكيد الدفعة
                  </Button>
                  <Input placeholder="سبب الرفض..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="h-10 bg-background" />
                  <Button onClick={() => rejectPayment(selected.payment_number)} variant="outline" className="w-full text-red-500 border-red-500/30 rounded-xl">
                    <X className="w-4 h-4 ml-2" /> رفض الدفعة
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}