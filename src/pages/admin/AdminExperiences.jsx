import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Briefcase, Loader2 } from 'lucide-react';
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

const emptyForm = {
  company: { ar: '', en: '' }, position: { ar: '', en: '' },
  description: { ar: '', en: '' }, company_logo: null,
  location: '', type: 'full_time', start_date: '', end_date: '',
  is_current: false, achievements: [], technologies_used: [],
  sort_order: 0, is_published: true,
};

export default function AdminExperiences() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [newAch, setNewAch] = useState('');
  const [newTech, setNewTech] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getExperiences(); setItems(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => { setEditingId(null); setForm({ ...emptyForm }); setDialogOpen(true); };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      company: item.company || { ar: '', en: '' }, position: item.position || { ar: '', en: '' },
      description: item.description || { ar: '', en: '' }, company_logo: item.company_logo || null,
      location: item.location || '', type: item.type || 'full_time',
      start_date: item.start_date || '', end_date: item.end_date || '',
      is_current: item.is_current || false, achievements: item.achievements || [],
      technologies_used: item.technologies_used || [],
      sort_order: item.sort_order || 0, is_published: item.is_published !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.ar) return toast.error('اسم الشركة مطلوب');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateExperience(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createExperience(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteExperience(id); toast.success('تم'); load(); } catch (e) { toast.error('فشل'); }
  };

  const typeLabel = { full_time: 'دوام كامل', part_time: 'دوام جزئي', freelance: 'حر', internship: 'تدريب' };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">الخبرات العملية</h1><p className="text-sm text-muted-foreground">{items.length} خبرة</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة خبرة</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد خبرات</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                    {item.company_logo ? <img src={item.company_logo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Briefcase className="w-5 h-5 text-primary/40" /></div>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{item.position?.ar || item.position?.en}</h3>
                    <p className="text-xs text-muted-foreground">{item.company?.ar || item.company?.en} — {item.location}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px]">{typeLabel[item.type] || item.type}</Badge>
                      {item.is_current && <Badge className="bg-green-500/10 text-green-600 text-[9px]">حالي</Badge>}
                    </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل الخبرة' : 'خبرة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <ImageUpload value={form.company_logo} onChange={(url) => setForm({ ...form, company_logo: url })} folder="experiences" label="شعار الشركة" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الشركة (عربي) *</Label><Input value={form.company.ar} onChange={(e) => setForm({ ...form, company: { ...form.company, ar: e.target.value } })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>الشركة (إنجليزي)</Label><Input value={form.company.en} onChange={(e) => setForm({ ...form, company: { ...form.company, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>المسمى (عربي)</Label><Input value={form.position.ar} onChange={(e) => setForm({ ...form, position: { ...form.position, ar: e.target.value } })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>المسمى (إنجليزي)</Label><Input value={form.position.en} onChange={(e) => setForm({ ...form, position: { ...form.position, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>الموقع</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>النوع</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                  <option value="full_time">دوام كامل</option><option value="part_time">دوام جزئي</option><option value="freelance">عمل حر</option><option value="internship">تدريب</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_current} onCheckedChange={(v) => setForm({ ...form, is_current: v })} /><Label className="text-xs">حالي</Label></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>تاريخ البدء</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>تاريخ الانتهاء</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="h-10 bg-background" dir="ltr" disabled={form.is_current} /></div>
            </div>
            <div className="space-y-2"><Label>الوصف (عربي)</Label><Textarea value={form.description.ar} onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="min-h-[60px] bg-background resize-none" /></div>

            {/* الإنجازات */}
            <div className="space-y-2">
              <Label>الإنجازات</Label>
              {(form.achievements || []).map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs"><span className="flex-1">• {a}</span><button onClick={() => setForm({ ...form, achievements: form.achievements.filter((_, j) => j !== i) })} className="text-red-500"><Trash2 className="w-3 h-3" /></button></div>
              ))}
              <div className="flex gap-2">
                <Input value={newAch} onChange={(e) => setNewAch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newAch.trim() && (setForm({ ...form, achievements: [...form.achievements, newAch.trim()] }), setNewAch('')))} className="h-9 bg-background text-xs" placeholder="إنجاز..." />
                <Button type="button" variant="outline" size="sm" onClick={() => { if (newAch.trim()) { setForm({ ...form, achievements: [...form.achievements, newAch.trim()] }); setNewAch(''); } }} className="h-9 text-xs shrink-0"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
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