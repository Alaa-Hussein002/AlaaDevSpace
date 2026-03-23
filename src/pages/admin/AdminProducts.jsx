import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, ShoppingBag, Loader2, Eye, EyeOff,
  Star, Package, Download, Truck, DollarSign, Tag, Hash,
  Search, Filter, Monitor, Box, Shield, Mail, FileDown,
  Layers, Zap, BarChart3, Image as ImageIcon, Link2, Settings,
  Calendar, Gift, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';
import ImageUpload from '@/components/ui/image-upload';

/* ============================================ */
/*  مولّد Slug احترافي (عربي + إنجليزي)         */
/* ============================================ */
const ARABIC_MAP = {
  'ا':'a','أ':'a','إ':'i','آ':'aa','ب':'b','ت':'t','ث':'th',
  'ج':'j','ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z',
  'س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'dh','ع':'a',
  'غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n',
  'ه':'h','و':'w','ي':'y','ى':'a','ة':'h','ئ':'e','ء':'',
  'ؤ':'o','َ':'a','ُ':'u','ِ':'i','ّ':'','ْ':'','ً':'','ٌ':'','ٍ':'',
};

function generateSlug(nameAr, nameEn) {
  let text = (nameEn || '').trim() || (nameAr || '').trim();
  if (!text) return '';
  let result = '';
  for (const char of text) {
    result += ARABIC_MAP[char] !== undefined ? ARABIC_MAP[char] : char;
  }
  result = result
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  const uid = Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(-3);
  return result ? `${result}-${uid}` : uid;
}

/* ============================================ */
/*  حساب السعر بعد الخصم                        */
/* ============================================ */
function computeDiscountedPrice(pricing) {
  if (!pricing || pricing.offer_type !== 'discount' || !pricing.discount_value) return pricing?.price || 0;
  if (pricing.discount_type === 'percentage') {
    return Math.max(0, +(pricing.price * (1 - pricing.discount_value / 100)).toFixed(2));
  }
  return Math.max(0, +(pricing.price - pricing.discount_value).toFixed(2));
}

function getOfferType(pricing) {
  if (pricing?.offer_type && pricing.offer_type !== 'none') return pricing.offer_type;
  if (pricing?.is_free) return 'free';
  if (pricing?.compare_at_price > 0 && pricing?.compare_at_price > (pricing?.price || 0)) return 'discount';
  return 'none';
}

/* ============================================ */
/*  ثوابت                                      */
/* ============================================ */
const TYPE_CONFIG = {
  digital:  { label: 'رقمي',  color: '#8b5cf6', icon: Download, emoji: '💾', desc: 'يُرسل الرابط بعد تأكيد الدفع' },
  physical: { label: 'ملموس', color: '#f59e0b', icon: Truck,    emoji: '📦', desc: 'يتطلب شحن وتوصيل' },
};

const STATUS_CONFIG = {
  published: { label: 'منشور',  color: '#10b981', bg: 'bg-green-500/10 text-green-600 border-green-500/20' },
  draft:     { label: 'مسودة',  color: '#6b7280', bg: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  archived:  { label: 'مؤرشف', color: '#ef4444', bg: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

const emptyForm = {
  name: { ar: '', en: '' },
  slug: '',
  description: { ar: '', en: '' },
  short_description: '',
  product_type: 'digital',
  status: 'published',
  pricing: {
    price: 0,
    currency: 'USD',
    offer_type: 'none',
    discount_type: 'percentage',
    discount_value: 0,
    offer_start: '',
    offer_end: '',
  },
  media: { thumbnail: null, gallery: [], preview_url: '' },
  digital_file: { url: '', file_type: '', file_size: '' },
  physical_info: { weight: '', dimensions: '', stock_quantity: 0 },
  shipping: { required: false, free_shipping: false, shipping_note: '' },
  attributes: {},
  is_featured: false,
  is_published: true,
  sort_order: 0,
  tags: [],
  category_id: '',
};

/* ============================================ */
/*  بطاقة منتج                                  */
/* ============================================ */
function ProductCard({ product, index, onEdit, onDelete, onToggle }) {
  const type = TYPE_CONFIG[product.product_type] || TYPE_CONFIG.digital;
  const TypeIcon = type.icon;
  const status = STATUS_CONFIG[product.status] || STATUS_CONFIG.published;
  const price = product.pricing;
  const isHidden = product.is_published === false;
  const offerType = getOfferType(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        isHidden ? 'opacity-50' : ''
      }`}>
        {/* خط علوي بلون النوع */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${type.color}66, ${type.color}, ${type.color}66)` }} />

        <div className="p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            {/* الصورة */}
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-border/30 bg-muted/50 relative">
              {product.media?.thumbnail ? (
                <img src={product.media.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${type.color}08` }}>
                  <TypeIcon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: `${type.color}30` }} />
                </div>
              )}
              <div className="absolute bottom-1 right-1 text-[10px]">{type.emoji}</div>
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                  {product.name?.ar || product.name?.en || 'بدون اسم'}
                </h3>
                <div className="hidden sm:flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onToggle(product)}>
                    {isHidden ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit(product)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10" onClick={() => onDelete(product.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {product.short_description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{product.short_description}</p>
              )}

              {/* الشارات */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge variant="outline" className="text-[9px] h-5 gap-0.5"
                  style={{ borderColor: `${type.color}30`, color: type.color }}>
                  <TypeIcon className="w-2.5 h-2.5" /> {type.label}
                </Badge>
                <Badge className={`text-[9px] h-5 ${status.bg}`}>{status.label}</Badge>
                {product.is_featured && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] h-5 gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-500" /> مميز
                  </Badge>
                )}
                {isHidden && (
                  <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                    <EyeOff className="w-2.5 h-2.5" /> مخفي
                  </Badge>
                )}
                {product.product_type === 'digital' && (
                  <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> محمي
                  </Badge>
                )}
                {/* كل منتج ملموس يدعم الدفع عند الاستلام (يُدار من المدفوعات) */}
                {product.product_type === 'physical' && (
                  <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                    <DollarSign className="w-2.5 h-2.5" /> دفع عند الاستلام
                  </Badge>
                )}
                {/* شارة العرض */}
                {offerType === 'discount' && (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] h-5 gap-0.5">
                    🏷️ {price?.discount_type === 'percentage' ? `-${price.discount_value}%` : `-$${price.discount_value}`}
                  </Badge>
                )}
                {offerType === 'free' && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] h-5 gap-0.5">
                    🆓 مجاني
                  </Badge>
                )}
                {/* شارة مدة العرض */}
                {(offerType === 'discount' || offerType === 'free') && price?.offer_end && (
                  <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                    <Calendar className="w-2.5 h-2.5" /> حتى {new Date(price.offer_end).toLocaleDateString('ar')}
                  </Badge>
                )}
              </div>

              {/* السعر + الإحصائيات */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                {/* === عرض السعر حسب نوع العرض === */}
                {offerType === 'free' ? (
                  <>
                    <span className="text-sm font-bold text-green-500">مجاني 🆓</span>
                    {(price?.price || 0) > 0 && (
                      <span className="text-xs line-through text-muted-foreground">${price.price}</span>
                    )}
                  </>
                ) : offerType === 'discount' && price?.discount_value > 0 ? (
                  <>
                    <span className="text-sm font-bold" style={{ color: type.color }}>
                      ${computeDiscountedPrice(price)}
                    </span>
                    <span className="text-xs line-through text-muted-foreground">${price?.price || 0}</span>
                  </>
                ) : (price?.compare_at_price > 0 && price?.compare_at_price > (price?.price || 0)) ? (
                  <>
                    <span className="text-sm font-bold" style={{ color: type.color }}>${price.price || 0}</span>
                    <span className="text-xs line-through text-muted-foreground">${price.compare_at_price}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold" style={{ color: type.color }}>
                    ${price?.price || 0}
                  </span>
                )}
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{product.stats?.views_count || 0}</span>
                <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{product.stats?.sales_count || 0}</span>
                {product.product_type === 'physical' && product.physical_info?.stock_quantity !== undefined && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="flex items-center gap-1"><Box className="w-3 h-3" />مخزون: {product.physical_info.stock_quantity}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* أزرار Mobile */}
          <div className="flex sm:hidden items-center justify-end gap-1 mt-3 pt-3 border-t border-border/30">
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={() => onToggle(product)}>
              {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {isHidden ? 'إظهار' : 'إخفاء'}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={() => onEdit(product)}>
              <Pencil className="w-3 h-3" /> تعديل
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1 text-red-500" onClick={() => onDelete(product.id)}>
              <Trash2 className="w-3 h-3" /> حذف
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ============================================ */
/*  الصفحة الرئيسية                             */
/* ============================================ */
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
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [autoSlug, setAutoSlug] = useState(true);

  useState(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getProducts(); setProducts(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  /* === معالج تغيير الاسم مع توليد Slug تلقائي === */
  const handleNameChange = (lang, value) => {
    const newName = { ...form.name, [lang]: value };
    const updates = { name: newName };
    if (autoSlug) {
      updates.slug = generateSlug(newName.ar, newName.en);
    }
    setForm(prev => ({ ...prev, ...updates }));
  };

  const openNew = () => {
    setEditingId(null);
    setAutoSlug(true);
    setForm({
      ...emptyForm,
      sort_order: products.length,
      media: { thumbnail: null, gallery: [], preview_url: '' },
      attributes: {},
      digital_file: { url: '', file_type: '', file_size: '' },
      physical_info: { weight: '', dimensions: '', stock_quantity: 0 },
      shipping: { required: false, free_shipping: false, shipping_note: '' },
      pricing: { price: 0, currency: 'USD', offer_type: 'none', discount_type: 'percentage', discount_value: 0, offer_start: '', offer_end: '' },
    });
    setNewTag(''); setAttrKey(''); setAttrVal('');
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setAutoSlug(false);

    /* تحويل صيغة التسعير القديمة للجديدة */
    const oldP = p.pricing || {};
    let newPricing = {
      price: oldP.price || 0,
      currency: oldP.currency || 'USD',
      offer_type: oldP.offer_type || 'none',
      discount_type: oldP.discount_type || 'percentage',
      discount_value: oldP.discount_value || 0,
      offer_start: oldP.offer_start || '',
      offer_end: oldP.offer_end || '',
    };
    if (!oldP.offer_type) {
      if (oldP.is_free) {
        newPricing.offer_type = 'free';
      } else if (oldP.compare_at_price > 0 && oldP.compare_at_price > oldP.price) {
        newPricing.offer_type = 'discount';
        newPricing.discount_type = 'fixed';
        newPricing.discount_value = +(oldP.compare_at_price - oldP.price).toFixed(2);
        newPricing.price = oldP.compare_at_price;
      }
    }

    setForm({
      name: p.name || { ar: '', en: '' },
      slug: p.slug || '',
      description: p.description || { ar: '', en: '' },
      short_description: p.short_description || '',
      product_type: p.product_type || 'digital',
      status: p.status || 'published',
      pricing: newPricing,
      media: p.media || { thumbnail: null, gallery: [], preview_url: '' },
      digital_file: p.digital_file || { url: '', file_type: '', file_size: '' },
      physical_info: {
        weight: p.physical_info?.weight || '',
        dimensions: p.physical_info?.dimensions || '',
        stock_quantity: p.physical_info?.stock_quantity || 0,
      },
      shipping: p.shipping || { required: false, free_shipping: false, shipping_note: '' },
      attributes: p.attributes || {},
      is_featured: p.is_featured || false,
      is_published: p.is_published !== false,
      sort_order: p.sort_order || 0,
      tags: p.tags || [],
      category_id: p.category_id || '',
    });
    setNewTag(''); setAttrKey(''); setAttrVal('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.ar && !form.name.en) return toast.error('اسم المنتج مطلوب');
    if (form.pricing.offer_type !== 'free' && (!form.pricing.price || form.pricing.price <= 0)) {
      return toast.error('السعر مطلوب');
    }
    if (form.pricing.offer_type === 'discount') {
      if (!form.pricing.discount_value || form.pricing.discount_value <= 0) return toast.error('قيمة الخصم مطلوبة');
      if (form.pricing.discount_type === 'percentage' && form.pricing.discount_value > 100) return toast.error('نسبة الخصم لا يمكن أن تتجاوز 100%');
      if (form.pricing.discount_type === 'fixed' && form.pricing.discount_value >= form.pricing.price) return toast.error('مبلغ الخصم يجب أن يكون أقل من السعر');
    }
    if (form.product_type === 'digital' && form.pricing.offer_type !== 'free' && !form.digital_file.url) {
      toast.warning('تنبيه: لم تُضف رابط الملف الرقمي');
    }

    /* تجهيز البيانات مع التوافق العكسي */
    const saveData = {
      ...form,
      slug: form.slug || generateSlug(form.name.ar, form.name.en),
      pricing: {
        ...form.pricing,
        is_free: form.pricing.offer_type === 'free',
        compare_at_price: form.pricing.offer_type === 'discount' ? form.pricing.price : 0,
      },
    };

    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateProduct(editingId, saveData); toast.success('تم تحديث المنتج'); }
      else { await adminAPI.createProduct(saveData); toast.success('تم إنشاء المنتج'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المنتج؟')) return;
    try { await adminAPI.deleteProduct(id); toast.success('تم الحذف'); load(); }
    catch (e) { toast.error('فشل'); }
  };

  const handleToggle = async (product) => {
    try {
      const newVal = !product.is_published;
      await adminAPI.updateProduct(product.id, {
        name: product.name, slug: product.slug, description: product.description,
        short_description: product.short_description, product_type: product.product_type,
        status: product.status, pricing: product.pricing, media: product.media,
        digital_file: product.digital_file, physical_info: product.physical_info,
        shipping: product.shipping, attributes: product.attributes,
        is_featured: product.is_featured, sort_order: product.sort_order,
        tags: product.tags, category_id: product.category_id,
        is_published: newVal,
      });
      toast.success(newVal ? 'تم إظهار المنتج' : 'تم إخفاء المنتج');
      load();
    } catch (e) { toast.error('فشل'); }
  };

  const addTag = () => { if (!newTag.trim()) return; if (form.tags.includes(newTag.trim())) return; setForm({ ...form, tags: [...form.tags, newTag.trim()] }); setNewTag(''); };
  const addAttr = () => { if (!attrKey.trim()) return; setForm({ ...form, attributes: { ...form.attributes, [attrKey.trim()]: attrVal.trim() } }); setAttrKey(''); setAttrVal(''); };

  const filtered = products.filter((p) => {
    const name = (p.name?.ar || p.name?.en || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchType = filterType === 'all' || p.product_type === filterType;
    return matchSearch && matchType;
  });

  const digitalCount = products.filter(p => p.product_type === 'digital').length;
  const physicalCount = products.filter(p => p.product_type === 'physical').length;
  const publishedCount = products.filter(p => p.is_published !== false).length;

  /* === حساب معاينة السعر في النموذج === */
  const previewDiscounted = computeDiscountedPrice(form.pricing);
  const previewSavings = form.pricing.offer_type === 'discount'
    ? +(form.pricing.price - previewDiscounted).toFixed(2) : 0;

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* الشريط العلوي */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> إدارة المنتجات
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-muted-foreground">{products.length} منتج</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-purple-500">💾 {digitalCount} رقمي</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-amber-500">📦 {physicalCount} ملموس</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-green-500">{publishedCount} منشور</span>
          </div>
        </div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
          <Plus className="w-4 h-4 ml-2" /> إضافة منتج
        </Button>
      </div>

      {/* البحث والفلاتر */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-10 bg-card/60 border-border/50 rounded-xl text-sm" />
          </div>
          <div className="flex gap-1.5">
            {[
              { key: 'all', label: 'الكل', count: products.length },
              { key: 'digital', label: '💾 رقمي', count: digitalCount },
              { key: 'physical', label: '📦 ملموس', count: physicalCount },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filterType === f.key ? 'gradient-bg text-white shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}>
                {f.label} <span className={`text-[10px] mr-1 px-1 py-0.5 rounded ${filterType === f.key ? 'bg-white/20' : 'bg-muted'}`}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* القائمة */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}</div>
      ) : products.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-16 text-center border-dashed border-border/50">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">لا توجد منتجات بعد</h3>
            <p className="text-sm text-muted-foreground mb-6">أضف منتجاتك الرقمية أو الملموسة</p>
            <Button onClick={openNew} className="gradient-bg text-white rounded-xl"><Plus className="w-4 h-4 ml-2" /> أضف أول منتج</Button>
          </Card>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12"><Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" /><p className="text-sm text-muted-foreground">لا توجد نتائج</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {/* ═══ Dialog ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
          <div className="sticky top-0 z-10 border-b backdrop-blur-xl bg-background/95 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                <ShoppingBag className="w-5 h-5 text-primary" />
                {editingId ? 'تعديل المنتج' : 'منتج جديد'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {form.product_type === 'digital' ? '💾 منتج رقمي — يُرسل الرابط للعميل بعد تأكيد الدفع' : '📦 منتج ملموس — يتطلب شحن وتوصيل'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 space-y-6">

            {/* ═══ نوع المنتج ═══ */}
            <div className="pt-2">
              <Label className="text-xs font-bold mb-3 block">نوع المنتج</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const isActive = form.product_type === key;
                  return (
                    <button key={key} onClick={() => setForm({ ...form, product_type: key })}
                      className={`relative p-4 rounded-xl border-2 text-right transition-all ${
                        isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-border/30 hover:border-border/60'
                      }`}>
                      {isActive && <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cfg.color}15` }}>
                          <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{cfg.emoji} {cfg.label}</p>
                          <p className="text-[10px] text-muted-foreground">{cfg.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══ الصورة ═══ */}
            <div>
              <Label className="text-xs font-bold mb-2 block flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5 text-primary" /> صورة المنتج</Label>
              <ImageUpload value={form.media?.thumbnail} onChange={(url) => setForm({ ...form, media: { ...form.media, thumbnail: url } })} folder="products" label="" />
            </div>

            {/* ═══ المعلومات الأساسية ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> معلومات المنتج</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">الاسم (عربي) *</Label>
                  <Input value={form.name.ar} onChange={(e) => handleNameChange('ar', e.target.value)} className="h-10 bg-muted/50 text-sm" placeholder="قالب React احترافي" /></div>
                <div className="space-y-1.5"><Label className="text-xs">الاسم (إنجليزي)</Label>
                  <Input value={form.name.en} onChange={(e) => handleNameChange('en', e.target.value)} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="Professional React Template" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* === Slug مع زر التوليد === */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    Slug
                    {autoSlug && <span className="text-[9px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">تلقائي</span>}
                  </Label>
                  <div className="flex gap-2">
                    <Input value={form.slug}
                      onChange={(e) => { setAutoSlug(false); setForm({ ...form, slug: e.target.value }); }}
                      className="h-10 bg-muted/50 text-sm flex-1" dir="ltr" placeholder="يُنشأ تلقائياً" />
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => { const s = generateSlug(form.name.ar, form.name.en); setForm({ ...form, slug: s }); setAutoSlug(true); }}
                      className="h-10 text-xs shrink-0 rounded-xl gap-1 px-3">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">الترتيب</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="h-10 bg-muted/50 text-sm" min="0" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">وصف مختصر</Label>
                <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="h-10 bg-muted/50 text-sm" placeholder="جملة واحدة تصف المنتج" /></div>
              <div className="space-y-1.5"><Label className="text-xs">الوصف الكامل (عربي)</Label>
                <Textarea value={form.description.ar} onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="min-h-[80px] bg-muted/50 resize-none text-sm" /></div>
            </div>

            {/* ═══════════════════════════════════ */}
            {/*  التسعير والعروض                     */}
            {/* ═══════════════════════════════════ */}
            <div className="space-y-4 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> التسعير</h3>

              {/* السعر الأساسي */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">السعر الأساسي ($) *</Label>
                  <Input type="number" step="0.01" value={form.pricing.price}
                    onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, price: parseFloat(e.target.value) || 0 } })}
                    className="h-10 bg-muted/50 text-sm" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">العملة</Label>
                  <select value={form.pricing.currency}
                    onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, currency: e.target.value } })}
                    className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm">
                    <option value="USD">USD $</option>
                    <option value="SAR">SAR ﷼</option>
                    <option value="YER">YER ﷼</option>
                  </select>
                </div>
              </div>

              {/* === اختيار نوع العرض === */}
              <div className="space-y-2">
                <Label className="text-xs font-bold">العروض والخصومات</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'none', label: 'بدون عرض', icon: DollarSign, color: '#6b7280', emoji: '💲' },
                    { key: 'discount', label: 'خصم', icon: Tag, color: '#ef4444', emoji: '🏷️' },
                    { key: 'free', label: 'مجاني', icon: Gift, color: '#10b981', emoji: '🆓' },
                  ].map(({ key, label, icon: Icon, color, emoji }) => (
                    <button key={key}
                      onClick={() => setForm({ ...form, pricing: { ...form.pricing, offer_type: key } })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.pricing.offer_type === key
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border/30 hover:border-border/60'
                      }`}>
                      <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                      <p className="text-[11px] font-medium">{emoji} {label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* === إعدادات الخصم === */}
              {form.pricing.offer_type === 'discount' && (
                <div className="space-y-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> إعدادات الخصم
                  </p>

                  {/* نوع الخصم */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setForm({ ...form, pricing: { ...form.pricing, discount_type: 'percentage' } })}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        form.pricing.discount_type === 'percentage'
                          ? 'border-red-500 bg-red-500/10 text-red-600'
                          : 'border-border/30 text-muted-foreground hover:border-border/60'
                      }`}>
                      نسبة مئوية %
                    </button>
                    <button
                      onClick={() => setForm({ ...form, pricing: { ...form.pricing, discount_type: 'fixed' } })}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        form.pricing.discount_type === 'fixed'
                          ? 'border-red-500 bg-red-500/10 text-red-600'
                          : 'border-border/30 text-muted-foreground hover:border-border/60'
                      }`}>
                      مبلغ ثابت $
                    </button>
                  </div>

                  {/* قيمة الخصم */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {form.pricing.discount_type === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم ($)'}
                    </Label>
                    <Input type="number" step="0.01"
                      value={form.pricing.discount_value}
                      onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, discount_value: parseFloat(e.target.value) || 0 } })}
                      className="h-10 bg-white/80 dark:bg-muted/50 text-sm" dir="ltr"
                      placeholder={form.pricing.discount_type === 'percentage' ? '20' : '10'}
                      max={form.pricing.discount_type === 'percentage' ? 100 : form.pricing.price}
                    />
                  </div>

                  {/* مدة الخصم */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> بداية الخصم</Label>
                      <Input type="datetime-local" value={form.pricing.offer_start}
                        onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, offer_start: e.target.value } })}
                        className="h-10 bg-white/80 dark:bg-muted/50 text-xs" dir="ltr" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> نهاية الخصم</Label>
                      <Input type="datetime-local" value={form.pricing.offer_end}
                        onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, offer_end: e.target.value } })}
                        className="h-10 bg-white/80 dark:bg-muted/50 text-xs" dir="ltr" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">💡 اترك التواريخ فارغة لجعل الخصم دائم</p>

                  {/* معاينة السعر */}
                  {form.pricing.price > 0 && form.pricing.discount_value > 0 && (
                    <div className="p-3 rounded-lg bg-background border border-border/50 space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground">معاينة السعر:</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs line-through text-muted-foreground">${form.pricing.price}</span>
                        <span className="text-lg font-bold text-red-500">${previewDiscounted}</span>
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">
                          وفّر ${previewSavings}
                          {form.pricing.discount_type === 'percentage' && ` (${form.pricing.discount_value}%)`}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === إعدادات المجاني === */}
              {form.pricing.offer_type === 'free' && (
                <div className="space-y-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" /> عرض مجاني
                  </p>
                  <div className="p-2.5 rounded-lg bg-green-500/10 text-xs text-green-700 dark:text-green-400">
                    🆓 المنتج سيكون مجاني خلال الفترة المحددة. اترك التواريخ فارغة لجعله مجاني بشكل دائم.
                  </div>

                  {/* مدة العرض المجاني */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> بداية العرض</Label>
                      <Input type="datetime-local" value={form.pricing.offer_start}
                        onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, offer_start: e.target.value } })}
                        className="h-10 bg-white/80 dark:bg-muted/50 text-xs" dir="ltr" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> نهاية العرض</Label>
                      <Input type="datetime-local" value={form.pricing.offer_end}
                        onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, offer_end: e.target.value } })}
                        className="h-10 bg-white/80 dark:bg-muted/50 text-xs" dir="ltr" />
                    </div>
                  </div>

                  {/* معاينة */}
                  {form.pricing.price > 0 && (
                    <div className="p-3 rounded-lg bg-background border border-border/50 space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground">معاينة السعر:</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs line-through text-muted-foreground">${form.pricing.price}</span>
                        <span className="text-lg font-bold text-green-500">مجاني 🎁</span>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">
                          وفّر ${form.pricing.price}
                        </Badge>
                      </div>
                      {form.pricing.offer_end && (
                        <p className="text-[10px] text-muted-foreground">
                          ⏰ ينتهي: {new Date(form.pricing.offer_end).toLocaleString('ar')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═══ حقول خاصة بالنوع ═══ */}
            {form.product_type === 'digital' ? (
              <div className="space-y-3 border-t border-border/50 pt-5">
                <h3 className="text-sm font-bold flex items-center gap-2"><Download className="w-4 h-4 text-purple-500" /> إعدادات المنتج الرقمي</h3>
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-600">
                  <Shield className="w-4 h-4 inline ml-1" /> الرابط محمي — لن يتمكن العميل من التنزيل إلا بعد تأكيد الدفع. سيُرسل الرابط إلى بريده الإلكتروني تلقائياً.
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-600">
                  💡 <strong>نصيحة:</strong> ارفع الملف على خدمة خارجية (AWS S3, Google Drive, Cloudflare R2) وضع الرابط هنا.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5"><Label className="text-xs">رابط الملف (محمي) *</Label>
                    <Input value={form.digital_file.url} onChange={(e) => setForm({ ...form, digital_file: { ...form.digital_file, url: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="https://storage.example.com/file.zip" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">نوع الملف</Label>
                    <Input value={form.digital_file.file_type} onChange={(e) => setForm({ ...form, digital_file: { ...form.digital_file, file_type: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="ZIP, PDF..." /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">حجم الملف</Label>
                    <Input value={form.digital_file.file_size} onChange={(e) => setForm({ ...form, digital_file: { ...form.digital_file, file_size: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="25 MB" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">رابط المعاينة (اختياري)</Label>
                    <Input value={form.media.preview_url} onChange={(e) => setForm({ ...form, media: { ...form.media, preview_url: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="https://demo.example.com" /></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 border-t border-border/50 pt-5">
                <h3 className="text-sm font-bold flex items-center gap-2"><Truck className="w-4 h-4 text-amber-500" /> إعدادات المنتج الملموس</h3>
                {/* ملاحظة: الدفع عند الاستلام يُدار من إعدادات المدفوعات */}
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-600">
                  💰 <strong>الدفع عند الاستلام:</strong> يُفعّل تلقائياً لجميع المنتجات الملموسة ويُدار من صفحة إعدادات المدفوعات.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">الكمية في المخزون *</Label>
                    <Input type="number" value={form.physical_info.stock_quantity} onChange={(e) => setForm({ ...form, physical_info: { ...form.physical_info, stock_quantity: parseInt(e.target.value) || 0 } })} className="h-10 bg-muted/50 text-sm" min="0" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">الوزن (كجم)</Label>
                    <Input value={form.physical_info.weight} onChange={(e) => setForm({ ...form, physical_info: { ...form.physical_info, weight: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="0.5" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">الأبعاد</Label>
                    <Input value={form.physical_info.dimensions} onChange={(e) => setForm({ ...form, physical_info: { ...form.physical_info, dimensions: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="30x20x5 cm" /></div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2"><Switch checked={form.shipping.required} onCheckedChange={(v) => setForm({ ...form, shipping: { ...form.shipping, required: v } })} /><Label className="text-xs">يتطلب شحن</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.shipping.free_shipping} onCheckedChange={(v) => setForm({ ...form, shipping: { ...form.shipping, free_shipping: v } })} /><Label className="text-xs">شحن مجاني</Label></div>
                </div>
                {form.shipping.required && (
                  <div className="space-y-1.5"><Label className="text-xs">ملاحظة الشحن</Label>
                    <Input value={form.shipping.shipping_note} onChange={(e) => setForm({ ...form, shipping: { ...form.shipping, shipping_note: e.target.value } })} className="h-10 bg-muted/50 text-sm" placeholder="التوصيل خلال 3-5 أيام عمل" /></div>
                )}
              </div>
            )}

            {/* ═══ الخصائص ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> خصائص المنتج <Badge variant="secondary" className="text-[9px]">{Object.keys(form.attributes).length}</Badge></h3>
              <div className="space-y-1.5">
                {Object.entries(form.attributes || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/30 group">
                    <span className="text-xs font-medium text-primary">{k}:</span>
                    <span className="text-xs flex-1">{String(v)}</span>
                    <button onClick={() => { const a = { ...form.attributes }; delete a[k]; setForm({ ...form, attributes: a }); }}
                      className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="المفتاح" className="h-9 bg-muted/50 text-xs flex-1" dir="ltr" />
                <Input value={attrVal} onChange={(e) => setAttrVal(e.target.value)} placeholder="القيمة" className="h-9 bg-muted/50 text-xs flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttr())} />
                <Button type="button" variant="outline" size="sm" onClick={addAttr} className="h-9 text-xs shrink-0 rounded-lg"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
            </div>

            {/* ═══ الوسوم ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Hash className="w-4 h-4 text-primary" /> الوسوم <Badge variant="secondary" className="text-[9px]">{form.tags.length}</Badge></h3>
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs px-2.5 py-1 rounded-lg group/tag">#{t}
                    <button onClick={() => setForm({ ...form, tags: form.tags.filter((_, j) => j !== i) })} className="hover:text-red-500 opacity-50 group-hover/tag:opacity-100"><Trash2 className="w-2.5 h-2.5" /></button>
                  </Badge>))}
              </div>
              <div className="flex gap-2">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="h-9 bg-muted/50 text-xs" dir="ltr" placeholder="template, react..." />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-9 text-xs shrink-0 rounded-lg"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
            </div>

            {/* ═══ الإعدادات ═══ */}
            <div className="space-y-4 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> الإعدادات</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">الحالة</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm">
                    <option value="published">✅ منشور</option><option value="draft">📝 مسودة</option><option value="archived">📦 مؤرشف</option>
                  </select></div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                  <Label className="text-xs">{form.is_featured ? '⭐ مميز' : 'مميز'}</Label>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <div><Label className="text-xs font-medium cursor-pointer">{form.is_published ? '✅ منشور — يظهر في المتجر' : '🔒 مخفي — لا يظهر في المتجر'}</Label>
                  <p className="text-[10px] text-muted-foreground">تحكم في إظهار أو إخفاء هذا المنتج</p></div>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/15 min-w-[130px]">
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingId ? 'حفظ التغييرات' : 'إنشاء المنتج'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Check(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}