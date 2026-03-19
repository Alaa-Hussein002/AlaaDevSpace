import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, FolderOpen, Eye, Loader2 } from 'lucide-react';
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
  title: { ar: '', en: '' }, slug: '', description: { ar: '', en: '' },
  short_description: '', category: '', status: 'completed',
  is_featured: false, is_published: true, sort_order: 0,
  tech_stack: [], features: [], tags: [],
  links: { live_demo: '', github: '' },
  media: { thumbnail: null, gallery: [] },
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [newTech, setNewTech] = useState('');
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getProjects(); setProjects(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => { setEditingId(null); setForm({ ...emptyForm, media: { thumbnail: null, gallery: [] } }); setDialogOpen(true); };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title || { ar: '', en: '' }, slug: p.slug || '',
      description: p.description || { ar: '', en: '' },
      short_description: p.short_description || '', category: p.category || '',
      status: p.status || 'completed', is_featured: p.is_featured || false,
      is_published: p.is_published !== false, sort_order: p.sort_order || 0,
      tech_stack: p.tech_stack || [], features: p.features || [], tags: p.tags || [],
      links: p.links || { live_demo: '', github: '' },
      media: p.media || { thumbnail: null, gallery: [] },
    });
    setDialogOpen(true);
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    setForm({ ...form, tech_stack: [...form.tech_stack, { name: newTech.trim() }] });
    setNewTech('');
  };

  const removeTech = (i) => setForm({ ...form, tech_stack: form.tech_stack.filter((_, j) => j !== i) });

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm({ ...form, features: [...form.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (i) => setForm({ ...form, features: form.features.filter((_, j) => j !== i) });

  const handleSave = async () => {
    if (!form.title.ar) return toast.error('العنوان بالعربي مطلوب');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateProject(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createProject(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteProject(id); toast.success('تم'); load(); } catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">إدارة المشاريع</h1><p className="text-sm text-muted-foreground">{projects.length} مشروع</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة مشروع</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center border-border/50">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد مشاريع</p>
          <Button onClick={openNew} variant="outline" className="mt-4 rounded-xl"><Plus className="w-4 h-4 ml-2" /> أضف أول مشروع</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  {/* صورة مصغرة */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                    {p.media?.thumbnail ? (
                      <img src={p.media.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><FolderOpen className="w-6 h-6 text-primary/40" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm truncate">{p.title?.ar || p.title?.en}</h3>
                      {p.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[9px]">مميز</Badge>}
                      <Badge variant="secondary" className="text-[9px]">{p.status === 'completed' ? 'مكتمل' : 'قيد التطوير'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.short_description}</p>
                    <div className="flex gap-1.5 mt-2">
                      {(p.tech_stack || []).slice(0, 4).map((t, j) => (
                        <span key={j} className="px-2 py-0.5 text-[9px] rounded bg-primary/5 text-primary">{t.name || t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-3"><Eye className="w-3 h-3" /> {p.views_count || 0}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل المشروع' : 'مشروع جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-5 mt-4">

            {/* صورة المشروع */}
            <ImageUpload
              value={form.media?.thumbnail}
              onChange={(url) => setForm({ ...form, media: { ...form.media, thumbnail: url } })}
              folder="projects"
              label="صورة المشروع الرئيسية"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>العنوان (عربي) *</Label><Input value={form.title.ar} onChange={(e) => setForm({ ...form, title: { ...form.title, ar: e.target.value } })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>العنوان (إنجليزي)</Label><Input value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-10 bg-background" dir="ltr" placeholder="auto" /></div>
              <div className="space-y-2"><Label>التصنيف</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 bg-background" placeholder="healthcare, education..." /></div>
            </div>

            <div className="space-y-2"><Label>وصف مختصر</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="h-10 bg-background" /></div>

            <div className="space-y-2"><Label>الوصف الكامل (عربي)</Label><Textarea value={form.description.ar} onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="min-h-[100px] bg-background resize-none" /></div>

            {/* التقنيات */}
            <div className="space-y-2">
              <Label>التقنيات المستخدمة</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tech_stack.map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs">
                    {t.name || t}
                    <button onClick={() => removeTech(i)} className="hover:text-red-500"><Trash2 className="w-2.5 h-2.5" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} placeholder="React, Laravel..." className="h-9 bg-background text-xs" dir="ltr" />
                <Button type="button" variant="outline" size="sm" onClick={addTech} className="h-9 text-xs shrink-0"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
            </div>

            {/* المميزات */}
            <div className="space-y-2">
              <Label>مميزات المشروع</Label>
              <div className="space-y-1.5 mb-2">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                    <span className="flex-1">• {f}</span>
                    <button onClick={() => removeFeature(i)} className="text-red-500 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="ميزة جديدة..." className="h-9 bg-background text-xs" />
                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="h-9 text-xs shrink-0"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
            </div>

            {/* الروابط */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>رابط العرض الحي</Label><Input value={form.links.live_demo} onChange={(e) => setForm({ ...form, links: { ...form.links, live_demo: e.target.value } })} className="h-10 bg-background" dir="ltr" placeholder="https://..." /></div>
              <div className="space-y-2"><Label>رابط GitHub</Label><Input value={form.links.github} onChange={(e) => setForm({ ...form, links: { ...form.links, github: e.target.value } })} className="h-10 bg-background" dir="ltr" placeholder="https://github.com/..." /></div>
            </div>

            {/* الإعدادات */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>الحالة</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                  <option value="completed">مكتمل</option><option value="in_progress">قيد التطوير</option><option value="planned">مخطط</option>
                </select>
              </div>
              <div className="space-y-2"><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="h-10 bg-background" /></div>
              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label className="text-xs">مميز</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label className="text-xs">منشور</Label></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{editingId ? 'حفظ التعديلات' : 'إنشاء المشروع'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}