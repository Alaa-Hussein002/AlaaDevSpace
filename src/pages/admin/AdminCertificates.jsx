import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Award, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';
import ImageUpload from '@/components/ui/image-upload';

export default function AdminCertificates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', issuer: '', issuer_logo: null, credential_id: '',
    credential_url: '', certificate_image: null, issue_date: '',
    expiry_date: '', has_expiry: false, skills_gained: [],
    sort_order: 0, is_published: true,
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getCertificates(); setItems(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ title: '', issuer: '', issuer_logo: null, credential_id: '', credential_url: '', certificate_image: null, issue_date: '', expiry_date: '', has_expiry: false, skills_gained: [], sort_order: 0, is_published: true });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title || '', issuer: item.issuer || '', issuer_logo: item.issuer_logo || null, credential_id: item.credential_id || '', credential_url: item.credential_url || '', certificate_image: item.certificate_image || null, issue_date: item.issue_date || '', expiry_date: item.expiry_date || '', has_expiry: item.has_expiry || false, skills_gained: item.skills_gained || [], sort_order: item.sort_order || 0, is_published: item.is_published !== false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) return toast.error('عنوان الشهادة مطلوب');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateCertificate(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createCertificate(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteCertificate(id); toast.success('تم'); load(); } catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">الشهادات</h1><p className="text-sm text-muted-foreground">{items.length} شهادة</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة شهادة</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد شهادات</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                    {item.issuer_logo ? <img src={item.issuer_logo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Award className="w-5 h-5 text-primary/40" /></div>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.issuer} — {item.issue_date}</p>
                    <div className="flex gap-1.5 mt-1">
                      {(item.skills_gained || []).slice(0, 3).map((s, j) => <Badge key={j} variant="secondary" className="text-[9px]">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {item.credential_url && <a href={item.credential_url} target="_blank"><Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button></a>}
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
          <DialogHeader><DialogTitle>{editingId ? 'تعديل الشهادة' : 'شهادة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload value={form.issuer_logo} onChange={(url) => setForm({ ...form, issuer_logo: url })} folder="certificates" label="شعار الجهة" />
              <ImageUpload value={form.certificate_image} onChange={(url) => setForm({ ...form, certificate_image: url })} folder="certificates" label="صورة الشهادة" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>عنوان الشهادة *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>الجهة المانحة *</Label><Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} className="h-10 bg-background" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>معرف الاعتماد</Label><Input value={form.credential_id} onChange={(e) => setForm({ ...form, credential_id: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>رابط التحقق</Label><Input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} className="h-10 bg-background" dir="ltr" placeholder="https://..." /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>تاريخ الإصدار</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>تاريخ الانتهاء</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="h-10 bg-background" dir="ltr" disabled={!form.has_expiry} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.has_expiry} onCheckedChange={(v) => setForm({ ...form, has_expiry: v })} /><Label className="text-xs">لها انتهاء</Label></div>
            </div>
            <div className="space-y-2">
              <Label>المهارات المكتسبة</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.skills_gained || []).map((s, i) => <Badge key={i} variant="secondary" className="gap-1 text-xs">{s}<button onClick={() => setForm({ ...form, skills_gained: form.skills_gained.filter((_, j) => j !== i) })} className="hover:text-red-500"><Trash2 className="w-2.5 h-2.5" /></button></Badge>)}
              </div>
              <div className="flex gap-2">
                <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSkill.trim() && (setForm({ ...form, skills_gained: [...form.skills_gained, newSkill.trim()] }), setNewSkill('')))} className="h-9 bg-background text-xs" dir="ltr" placeholder="React, Laravel..." />
                <Button type="button" variant="outline" size="sm" onClick={() => { if (newSkill.trim()) { setForm({ ...form, skills_gained: [...form.skills_gained, newSkill.trim()] }); setNewSkill(''); } }} className="h-9 text-xs shrink-0"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
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