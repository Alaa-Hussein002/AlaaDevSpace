import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, MessageSquareQuote, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';
import ImageUpload from '@/components/ui/image-upload';

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    client_name: '', client_title: '', client_company: '', client_avatar: null,
    content: { ar: '', en: '' }, rating: 5, is_featured: false, is_published: true, sort_order: 0,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getTestimonials(); setItems(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => { setEditingId(null); setForm({ client_name: '', client_title: '', client_company: '', client_avatar: null, content: { ar: '', en: '' }, rating: 5, is_featured: false, is_published: true, sort_order: 0 }); setDialogOpen(true); };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ client_name: item.client_name || '', client_title: item.client_title || '', client_company: item.client_company || '', client_avatar: item.client_avatar || null, content: item.content || { ar: '', en: '' }, rating: item.rating || 5, is_featured: item.is_featured || false, is_published: item.is_published !== false, sort_order: item.sort_order || 0 });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name || !form.content.ar) return toast.error('الاسم والمحتوى مطلوبان');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateTestimonial(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createTestimonial(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteTestimonial(id); toast.success('تم'); load(); } catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">التوصيات</h1><p className="text-sm text-muted-foreground">{items.length} توصية</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة توصية</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><MessageSquareQuote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد توصيات</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 shrink-0">
                    {item.client_avatar ? <img src={item.client_avatar} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">{item.client_name?.[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{item.client_name}</h3>
                      <div className="flex">{[...Array(item.rating || 0)].map((_, j) => <Star key={j} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}</div>
                      {item.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 text-[9px]">مميز</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.client_title} — {item.client_company}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">"{item.content?.ar}"</p>
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
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل التوصية' : 'توصية جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <ImageUpload value={form.client_avatar} onChange={(url) => setForm({ ...form, client_avatar: url })} folder="testimonials" label="صورة العميل" />
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>اسم العميل *</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>المسمى</Label><Input value={form.client_title} onChange={(e) => setForm({ ...form, client_title: e.target.value })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>الشركة</Label><Input value={form.client_company} onChange={(e) => setForm({ ...form, client_company: e.target.value })} className="h-10 bg-background" /></div>
            </div>
            <div className="space-y-2"><Label>المحتوى (عربي) *</Label><Textarea value={form.content.ar} onChange={(e) => setForm({ ...form, content: { ...form.content, ar: e.target.value } })} className="min-h-[80px] bg-background resize-none" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>التقييم (1-5)</Label><Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} className="h-10 bg-background" /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label className="text-xs">مميز</Label></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label className="text-xs">منشور</Label></div>
            </div>
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