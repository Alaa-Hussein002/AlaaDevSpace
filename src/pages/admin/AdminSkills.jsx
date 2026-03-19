import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Sparkles, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    category: { ar: '', en: '' },
    icon: '💻',
    color: '#3b82f6',
    sort_order: 0,
    is_published: true,
    technologies: [],
  });
  const [newTech, setNewTech] = useState({ name: '', proficiency: 80, years_of_experience: 1, is_featured: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getSkills();
      setSkills(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ category: { ar: '', en: '' }, icon: '💻', color: '#3b82f6', sort_order: 0, is_published: true, technologies: [] });
    setDialogOpen(true);
  };

  const openEdit = (skill) => {
    setEditingId(skill.id);
    setForm({
      category: skill.category || { ar: '', en: '' },
      icon: skill.icon || '💻',
      color: skill.color || '#3b82f6',
      sort_order: skill.sort_order || 0,
      is_published: skill.is_published !== false,
      technologies: skill.technologies || [],
    });
    setDialogOpen(true);
  };

  const addTech = () => {
    if (!newTech.name) return toast.error('اسم التقنية مطلوب');
    setForm({ ...form, technologies: [...form.technologies, { ...newTech }] });
    setNewTech({ name: '', proficiency: 80, years_of_experience: 1, is_featured: false });
  };

  const removeTech = (index) => {
    setForm({ ...form, technologies: form.technologies.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!form.category.ar) return toast.error('اسم الفئة بالعربي مطلوب');
    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateSkill(editingId, form);
        toast.success('تم التحديث');
      } else {
        await adminAPI.createSkill(form);
        toast.success('تم الإنشاء');
      }
      setDialogOpen(false);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteSkill(id); toast.success('تم الحذف'); load(); }
    catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">إدارة المهارات</h1>
          <p className="text-sm text-muted-foreground">{skills.length} فئة</p>
        </div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 ml-2" /> إضافة فئة
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : skills.length === 0 ? (
        <Card className="p-12 text-center border-border/50">
          <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد مهارات</p>
          <Button onClick={openNew} variant="outline" className="mt-4 rounded-xl"><Plus className="w-4 h-4 ml-2" /> أضف أول فئة</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {skills.map((skill, i) => (
            <motion.div key={skill.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{skill.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{skill.category?.ar || skill.category?.en}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(skill.technologies || []).map((t, j) => (
                        <Badge key={j} variant="secondary" className="text-[9px]">{t.name} ({t.proficiency}%)</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(skill)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(skill.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل الفئة' : 'فئة مهارات جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الفئة (عربي) *</Label>
                <Input value={form.category.ar} onChange={(e) => setForm({ ...form, category: { ...form.category, ar: e.target.value } })} className="h-10 bg-background" />
              </div>
              <div className="space-y-2">
                <Label>الفئة (إنجليزي)</Label>
                <Input value={form.category.en} onChange={(e) => setForm({ ...form, category: { ...form.category, en: e.target.value } })} className="h-10 bg-background" dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>أيقونة (Emoji)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="h-10 bg-background text-center text-xl" />
              </div>
              <div className="space-y-2">
                <Label>اللون</Label>
                <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 bg-background" />
              </div>
              <div className="space-y-2">
                <Label>الترتيب</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="h-10 bg-background" />
              </div>
            </div>

            {/* التقنيات */}
            <div className="space-y-3">
              <Label className="font-bold">التقنيات</Label>
              {form.technologies.map((tech, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <span className="text-sm flex-1">{tech.name}</span>
                  <Badge variant="secondary" className="text-[9px]">{tech.proficiency}%</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeTech(i)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-4 gap-2 items-end">
                <div className="space-y-1 col-span-2">
                  <Label className="text-[10px]">اسم التقنية</Label>
                  <Input value={newTech.name} onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} className="h-9 bg-background text-xs" placeholder="React.js" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">الإتقان %</Label>
                  <Input type="number" value={newTech.proficiency} onChange={(e) => setNewTech({ ...newTech, proficiency: parseInt(e.target.value) || 0 })} className="h-9 bg-background text-xs" />
                </div>
                <Button variant="outline" size="sm" onClick={addTech} className="h-9 text-xs">
                  <Plus className="w-3 h-3 ml-1" /> أضف
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl">
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingId ? 'حفظ' : 'إنشاء'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}