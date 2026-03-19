import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Ticket, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: '', name: '', description: '', discount_type: 'percentage', discount_value: 10,
    minimum_order_amount: 0, maximum_discount_amount: 0, usage_limit: 100,
    usage_per_user: 1, start_date: '', end_date: '', is_active: true,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getCoupons(); setItems(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => { setEditingId(null); setForm({ code: '', name: '', description: '', discount_type: 'percentage', discount_value: 10, minimum_order_amount: 0, maximum_discount_amount: 0, usage_limit: 100, usage_per_user: 1, start_date: '', end_date: '', is_active: true }); setDialogOpen(true); };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ code: item.code || '', name: item.name || '', description: item.description || '', discount_type: item.discount_type || 'percentage', discount_value: item.discount_value || 0, minimum_order_amount: item.minimum_order_amount || 0, maximum_discount_amount: item.maximum_discount_amount || 0, usage_limit: item.usage_limit || 100, usage_per_user: item.usage_per_user || 1, start_date: item.start_date || '', end_date: item.end_date || '', is_active: item.is_active !== false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.name) return toast.error('الكود والاسم مطلوبان');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateCoupon(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createCoupon(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteCoupon(id); toast.success('تم'); load(); } catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">كوبونات الخصم</h1><p className="text-sm text-muted-foreground">{items.length} كوبون</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة كوبون</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد كوبونات</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Ticket className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-primary">{item.code}</span>
                      <Badge variant="secondary" className="text-[9px]">{item.name}</Badge>
                      <Badge className={`text-[9px] border-0 ${item.is_valid ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{item.is_valid ? 'صالح' : 'منتهي'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.discount_type === 'percentage' ? `${item.discount_value}%` : `$${item.discount_value}`} خصم — استخدم {item.used_count || 0}/{item.usage_limit}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل الكوبون' : 'كوبون جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الكود *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="h-10 bg-background font-mono" dir="ltr" placeholder="SAVE20" /></div>
              <div className="space-y-2"><Label>الاسم *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 bg-background" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>نوع الخصم</Label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="percentage">نسبة %</option><option value="fixed">مبلغ ثابت</option></select>
              </div>
              <div className="space-y-2"><Label>قيمة الخصم</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>حد أقصى للخصم</Label><Input type="number" value={form.maximum_discount_amount} onChange={(e) => setForm({ ...form, maximum_discount_amount: parseFloat(e.target.value) || 0 })} className="h-10 bg-background" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>الحد الأدنى للطلب</Label><Input type="number" value={form.minimum_order_amount} onChange={(e) => setForm({ ...form, minimum_order_amount: parseFloat(e.target.value) || 0 })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>حد الاستخدام</Label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: parseInt(e.target.value) || 0 })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>لكل مستخدم</Label><Input type="number" value={form.usage_per_user} onChange={(e) => setForm({ ...form, usage_per_user: parseInt(e.target.value) || 1 })} className="h-10 bg-background" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>تاريخ البدء</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>تاريخ الانتهاء</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label className="text-xs">نشط</Label></div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl">{saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{editingId ? 'حفظ' : 'إنشاء'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}