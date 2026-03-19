import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Gamepad2, Loader2, Play, Trophy } from 'lucide-react';
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

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: { ar: '', en: '' }, slug: '', description: { ar: '', en: '' },
    game_type: 'puzzle', difficulty: 'medium',
    is_featured: false, is_active: true, sort_order: 0, tags: [],
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getGames(); setGames(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ name: { ar: '', en: '' }, slug: '', description: { ar: '', en: '' }, game_type: 'puzzle', difficulty: 'medium', is_featured: false, is_active: true, sort_order: 0, tags: [] });
    setDialogOpen(true);
  };

  const openEdit = (g) => {
    setEditingId(g.id);
    setForm({ name: g.name || { ar: '', en: '' }, slug: g.slug || '', description: g.description || { ar: '', en: '' }, game_type: g.game_type || 'puzzle', difficulty: g.difficulty || 'medium', is_featured: g.is_featured || false, is_active: g.is_active !== false, sort_order: g.sort_order || 0, tags: g.tags || [] });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.ar) return toast.error('اسم اللعبة مطلوب');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateGame(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createGame(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف اللعبة وجميع نتائجها؟')) return;
    try { await adminAPI.deleteGame(id); toast.success('تم الحذف'); load(); }
    catch (e) { toast.error('فشل'); }
  };

  const diffLabel = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">إدارة الألعاب</h1><p className="text-sm text-muted-foreground">{games.length} لعبة</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة لعبة</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : games.length === 0 ? (
        <Card className="p-12 text-center border-border/50"><Gamepad2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">لا توجد ألعاب</p></Card>
      ) : (
        <div className="space-y-3">
          {games.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center"><Gamepad2 className="w-6 h-6 text-primary" /></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{g.name?.ar || g.name?.en}</h3>
                    <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {g.stats?.play_count || 0}</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {g.stats?.highest_score || 0}</span>
                      <Badge variant="secondary" className="text-[9px]">{diffLabel[g.difficulty]}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(g.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل' : 'لعبة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <ImageUpload value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} folder="games" label="صورة الغلاف" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الاسم (عربي) *</Label><Input value={form.name.ar} onChange={(e) => setForm({ ...form, name: { ...form.name, ar: e.target.value } })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>الاسم (إنجليزي)</Label><Input value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
            </div>
            <div className="space-y-2"><Label>الوصف (عربي)</Label><Textarea value={form.description.ar} onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="min-h-[60px] bg-background resize-none" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>النوع</Label>
                <select value={form.game_type} onChange={(e) => setForm({ ...form, game_type: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                  <option value="puzzle">ألغاز</option><option value="action">أكشن</option><option value="quiz">أسئلة</option><option value="memory">ذاكرة</option>
                </select>
              </div>
              <div className="space-y-2"><Label>الصعوبة</Label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                  <option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">صعب</option>
                </select>
              </div>
              <div className="space-y-2"><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="h-10 bg-background" /></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label className="text-xs">مميزة</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label className="text-xs">نشطة</Label></div>
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