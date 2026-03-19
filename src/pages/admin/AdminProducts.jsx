import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, ShoppingBag, Loader2, Eye } from 'lucide-react';
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
  name: { ar: '', en: '' }, slug: '', description: { ar: '', en: '' },
  short_description: '', product_type: 'digital', status: 'published',
  pricing: { price: 0, compare_at_price: 0, currency: 'USD', is_free: false },
  media: { thumbnail: null, gallery: [], preview_url: '' },
  attributes: {}, is_featured: false, is_active: true, sort_order: 0, tags: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [newTag, setNewTag] = useState('');
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getProducts(); setProducts(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const openNew = () => { setEditingId(null); setForm({ ...emptyForm, media: { thumbnail: null, gallery: [], preview_url: '' }, attributes: {} }); setDialogOpen(true); };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name || { ar: '', en: '' }, slug: p.slug || '',
      description: p.description || { ar: '', en: '' },
      short_description: p.short_description || '',
      product_type: p.product_type || 'digital', status: p.status || 'published',
      pricing: p.pricing || { price: 0, compare_at_price: 0, currency: 'USD', is_free: false },
      media: p.media || { thumbnail: null, gallery: [], preview_url: '' },
      attributes: p.attributes || {},
      is_featured: p.is_featured || false, is_active: p.is_active !== false,
      sort_order: p.sort_order || 0, tags: p.tags || [],
    });
    setDialogOpen(true);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setForm({ ...form, tags: [...form.tags, newTag.trim()] });
    setNewTag('');
  };

  const addAttr = () => {
    if (!attrKey.trim()) return;
    setForm({ ...form, attributes: { ...form.attributes, [attrKey.trim()]: attrVal.trim() } });
    setAttrKey(''); setAttrVal('');
  };

  const handleSave = async () => {
    if (!form.name.ar) return toast.error('اسم المنتج مطلوب');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateProduct(editingId, form); toast.success('تم التحديث'); }
      else { await adminAPI.createProduct(form); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف؟')) return;
    try { await adminAPI.deleteProduct(id); toast.success('تم'); load(); } catch (e) { toast.error('فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">إدارة المنتجات</h1><p className="text-sm text-muted-foreground">{products.length} منتج</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة منتج</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center border-border/50">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد منتجات</p>
          <Button onClick={openNew} variant="outline" className="mt-4 rounded-xl"><Plus className="w-4 h-4 ml-2" /> أضف منتج</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                    {p.media?.thumbnail ? <img src={p.media.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-primary/40" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm truncate">{p.name?.ar || p.name?.en}</h3>
                      <Badge variant="secondary" className="text-[9px]">{p.product_type === 'digital' ? 'رقمي' : 'ملموس'}</Badge>
                      {p.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 text-[9px]">مميز</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.short_description}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-lg font-bold text-primary">{p.pricing?.is_free ? 'مجاني' : `$${p.pricing?.price || 0}`}</p>
                    <p className="text-[10px] text-muted-foreground"><Eye className="w-3 h-3 inline" /> {p.stats?.views_count || 0} | 🛒 {p.stats?.sales_count || 0}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل المنتج' : 'منتج جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-5 mt-4">
            <ImageUpload value={form.media?.thumbnail} onChange={(url) => setForm({ ...form, media: { ...form.media, thumbnail: url } })} folder="products" label="صورة المنتج" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الاسم (عربي) *</Label><Input value={form.name.ar} onChange={(e) => setForm({ ...form, name: { ...form.name, ar: e.target.value } })} className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label>الاسم (إنجليزي)</Label><Input value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
            </div>

            <div className="space-y-2"><Label>وصف مختصر</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="h-10 bg-background" /></div>
            <div className="space-y-2"><Label>الوصف الكامل (عربي)</Label><Textarea value={form.description.ar} onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="min-h-[80px] bg-background resize-none" /></div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>السعر ($)</Label><Input type="number" step="0.01" value={form.pricing.price} onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, price: parseFloat(e.target.value) || 0 } })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>قبل الخصم</Label><Input type="number" step="0.01" value={form.pricing.compare_at_price} onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, compare_at_price: parseFloat(e.target.value) || 0 } })} className="h-10 bg-background" dir="ltr" /></div>
              <div className="space-y-2"><Label>النوع</Label>
                <select value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="digital">رقمي</option><option value="physical">ملموس</option></select>
              </div>
              <div className="space-y-2"><Label>الحالة</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="published">منشور</option><option value="draft">مسودة</option><option value="archived">مؤرشف</option></select>
              </div>
            </div>

            {/* الخصائص */}
            <div className="space-y-2">
              <Label>خصائص المنتج</Label>
              <div className="space-y-1.5 mb-2">
                {Object.entries(form.attributes || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                    <span className="font-medium">{k}:</span><span className="flex-1">{String(v)}</span>
                    <button onClick={() => { const a = { ...form.attributes }; delete a[k]; setForm({ ...form, attributes: a }); }} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="المفتاح" className="h-9 bg-background text-xs" dir="ltr" />
                <Input value={attrVal} onChange={(e) => setAttrVal(e.target.value)} placeholder="القيمة" className="h-9 bg-background text-xs" />
                <Button type="button" variant="outline" size="sm" onClick={addAttr} className="h-9 text-xs shrink-0"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
            </div>

            {/* الوسوم */}
            <div className="space-y-2">
              <Label>الوسوم</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.tags || []).map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs">{t}<button onClick={() => setForm({ ...form, tags: form.tags.filter((_, j) => j !== i) })} className="hover:text-red-500"><Trash2 className="w-2.5 h-2.5" /></button></Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="وسم..." className="h-9 bg-background text-xs" dir="ltr" />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-9 text-xs shrink-0"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label className="text-xs">مميز</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label className="text-xs">نشط</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.pricing.is_free} onCheckedChange={(v) => setForm({ ...form, pricing: { ...form.pricing, is_free: v } })} /><Label className="text-xs">مجاني</Label></div>
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