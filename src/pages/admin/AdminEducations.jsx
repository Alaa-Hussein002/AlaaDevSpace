import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, GraduationCap, Loader2 } from 'lucide-react';
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

export default function AdminEducations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    institution: { ar: '', en: '' }, degree: { ar: '', en: '' },
    field_of_study: '', institution_logo: null, location: '',
    start_date: '', end_date: '', is_current: false,
    gpa: '', gpa_scale: '4.0', description: { ar: '', en: '' },
    sort_order: 0, is_published: true,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getEducations(); setItems(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ institution: { ar: '', en: '' }, degree: { ar: '', en: '' }, field_of_study: '', institution_logo: null, location: '', start_date: '', end_date: '', is_current: false, gpa: '', gpa_scale: '4.0', description: { ar: '', en: '' }, sort_order: 0, is_published: true });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      institution: item.institution || { ar: '', en: '' }, degree: item.degree || { ar: '', en: '' },
      field_of_study: item.field_of_study || '', institution_logo: item.institution_logo || null,
      location: item.location || '', start_date: item.start_date || '', end_date: item.end_date || '',
      is_current: item.is_current || false, gpa: item.gpa || '', gpa_scale: item.gpa_scale || '4.0',
      description: item.description || { ar: '', en: '' },
      sort_order: item.sort_order || 0, is_published: item.is_published !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.institution.ar) return toast.error('اسم المؤسسة مطلوب');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateEducation(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createEducation(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteEducation(id); toast.success('تم'); load(); } catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">المؤهلات التعليمية</h1><p className="text-sm text-muted-foreground">{items.length} مؤهل</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة مؤهل</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد مؤهلات</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                    {item.institution_logo ? <img src={item.institution_logo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-5 h-5 text-primary/40" /></div>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{item.degree?.ar || item.degree?.en}</h3>
                    <p className="text-xs text-muted-foreground">{item.institution?.ar || item.institution?.en} — {item.location}</p>
                    <div className="flex gap-2 mt-1">
                      {item.gpa && <Badge variant="secondary" className="text-[9px]">GPA: {item.gpa}/{item.gpa_scale}</Badge>}
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
          <DialogHeader><DialogTitle>{editingId ? 'تعديل المؤهل' : 'مؤهل جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <ImageUpload value={form.institution_logo} onChange={(url) => setForm({ ...form, institution_logo: url })} folder="education" label="شعار المؤسسة" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>المؤسسة (عربي) *</Label><Input value={form.institution.ar} onChange={(e) => setForm({ ...form, institution: { ...form.institution, ar: e.target.value } })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>المؤسسة (إنجليزي)</Label><Input value={form.institution.en} onChange={(e) => setForm({ ...form, institution: { ...form.institution, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الدرجة (عربي)</Label><Input value={form.degree.ar} onChange={(e) => setForm({ ...form, degree: { ...form.degree, ar: e.target.value } })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>الدرجة (إنجليزي)</Label><Input value={form.degree.en} onChange={(e) => setForm({ ...form, degree: { ...form.degree, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>التخصص</Label><Input value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>الموقع</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-10 bg-background" /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_current} onCheckedChange={(v) => setForm({ ...form, is_current: v })} /><Label className="text-xs">حالي</Label></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>تاريخ البدء</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>تاريخ الانتهاء</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="h-10 bg-background" dir="ltr" disabled={form.is_current} /></div>
              <div className="space-y-2"><Label>المعدل</Label><Input value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} className="h-10 bg-background" dir="ltr" placeholder="3.5" /></div>
              <div className="space-y-2"><Label>من</Label><Input value={form.gpa_scale} onChange={(e) => setForm({ ...form, gpa_scale: e.target.value })} className="h-10 bg-background" dir="ltr" placeholder="4.0" /></div>
            </div>
            <div className="space-y-2"><Label>الوصف (عربي)</Label><Textarea value={form.description.ar} onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="min-h-[60px] bg-background resize-none" /></div>

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