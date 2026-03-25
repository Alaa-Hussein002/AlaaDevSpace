import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, Eye, Tag, Star, Download, 
  Truck, ShoppingCart, Check, Zap, Filter, Layers, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { publicAPI } from '@/api/services';
import FavoriteButton from '@/components/ui/favorite-button';
import { toast } from 'sonner';

/* ============================================ */
/*  حساب السعر النهائي متوافق مع لوحة التحكم     */
/* ============================================ */
const calculateFinalPrice = (pricing) => {
  if (!pricing) return 0;
  if (pricing.offer_type === 'free' || pricing.is_free) return 0;
  if (pricing.offer_type === 'discount' && pricing.discount_value > 0) {
    if (pricing.discount_type === 'percentage') {
      return Math.max(0, +(pricing.price * (1 - pricing.discount_value / 100)).toFixed(2));
    }
    return Math.max(0, +(pricing.price - pricing.discount_value).toFixed(2));
  }
  return pricing.price || 0;
};

export default function Store() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [productType, setProductType] = useState('all'); // الفلتر الجديد للنوع
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        publicAPI.getProducts(),
        publicAPI.getCategories(),
      ]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء تحميل المتجر');
    } finally {
      setLoading(false);
    }
  };

  /* ============================================ */
  /* دالة الإضافة للسلة                           */
  /* ============================================ */
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    // TODO: استدعاء دالة الإضافة للسلة الفعلية هنا
    // addToCart(product);
    
    toast.success('تمت الإضافة إلى السلة بنجاح', {
      icon: <ShoppingCart className="w-4 h-4 text-green-500" />
    });

    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  // المنتجات المنشورة فقط
  const visibleProducts = products.filter(p => p.is_published !== false);

  // دالة الفلترة الشاملة (بحث + قسم + نوع المنتج)
  const filtered = visibleProducts.filter((p) => {
    const name = (p.name?.ar || p.name?.en || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchCategory = activeCategory === 'all' || p.category_id === activeCategory;
    const matchType = productType === 'all' || p.product_type === productType;
    
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ======================= */}
        {/* رأس الصفحة (Header) */}
        {/* ======================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
            <ShoppingBag className="w-3.5 h-3.5 ml-1.5" /> المتجر
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            المتجر <span className="gradient-text">الشامل</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            استكشف منتجاتنا الرقمية الفورية، وسلعنا القابلة للشحن. أضف ما يناسبك إلى السلة بخطوة واحدة.
          </p>
        </motion.div>

        {/* ======================= */}
        {/* شريط البحث والفلاتر     */}
        {/* ======================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          
          {/* شريط البحث */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
            <Input 
              placeholder="ابحث عن قالب، أداة، أو منتج..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pr-12 h-14 bg-card/50 backdrop-blur-xl border-border/50 rounded-2xl shadow-sm text-base focus-visible:ring-primary/20" 
            />
          </div>

          {/* فلتر نوع المنتج (الجديد) */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center p-1 bg-muted/50 rounded-2xl border border-border/50 backdrop-blur-md">
              <button
                onClick={() => setProductType('all')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  productType === 'all' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-4 h-4" /> الكل
              </button>
              <button
                onClick={() => setProductType('digital')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  productType === 'digital' 
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' 
                    : 'text-muted-foreground hover:text-purple-500'
                }`}
              >
                <Download className="w-4 h-4" /> رقمية
              </button>
              <button
                onClick={() => setProductType('physical')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  productType === 'physical' 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                    : 'text-muted-foreground hover:text-amber-500'
                }`}
              >
                <Package className="w-4 h-4" /> قابلة للشحن
              </button>
            </div>
          </div>

          {/* فلتر الأقسام */}
          {categories.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === 'all' 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                    : 'bg-card border border-border/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                جميع الأقسام
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                      : 'bg-card border border-border/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat.name?.ar || cat.name?.en}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ======================= */}
        {/* شبكة المنتجات         */}
        {/* ======================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] rounded-2xl bg-muted/50 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-border">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold mb-1">لا توجد منتجات مطابقة</h3>
            <p className="text-sm text-muted-foreground">حاول تغيير نوع المنتج أو القسم للوصول لنتائج أفضل</p>
            <Button variant="outline" className="mt-6 rounded-xl" onClick={() => {setSearch(''); setActiveCategory('all'); setProductType('all');}}>
              عرض جميع المنتجات
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => {
              const isFree = product.pricing?.offer_type === 'free' || product.pricing?.is_free;
              const hasDiscount = product.pricing?.offer_type === 'discount' && product.pricing?.discount_value > 0;
              const finalPrice = calculateFinalPrice(product.pricing);
              
              return (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  className="h-full flex"
                >
                  <Card className="flex flex-col flex-1 overflow-hidden group border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 rounded-2xl">
                    
                    {/* الصورة والـ Badges */}
                    <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
                      <Link to={`/store/${product.slug}`} className="block w-full h-full">
                        {product.media?.thumbnail ? (
                          <img 
                            src={product.media.thumbnail} 
                            alt={product.name?.ar} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <ShoppingBag className="w-12 h-12 text-primary/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>

                      {/* زر المفضلة */}
                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton item={product} type="product" />
                      </div>

                      {/* شارات المنتج (تم تحديث المسميات هنا) */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-end z-10 pointer-events-none">
                        <Badge className={`border-0 gap-1 text-[10px] shadow-sm backdrop-blur-md ${
                          product.product_type === 'digital' 
                            ? 'bg-purple-500/90 text-white' 
                            : 'bg-amber-500/90 text-white'
                        }`}>
                          {product.product_type === 'digital' ? (
                            <><Download className="w-3 h-3" /> رقمي</>
                          ) : (
                            <><Package className="w-3 h-3" /> قابل للشحن</>
                          )}
                        </Badge>
                        
                        {isFree ? (
                          <Badge className="bg-green-500 text-white border-0 gap-1 text-[10px] shadow-sm">
                            <Zap className="w-3 h-3 fill-current" /> مجاني
                          </Badge>
                        ) : hasDiscount && (
                          <Badge className="bg-red-500 text-white border-0 text-[10px] shadow-sm">
                            خصم {product.pricing.discount_type === 'percentage' ? `${product.pricing.discount_value}%` : `$${product.pricing.discount_value}`}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* تفاصيل المنتج */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <Link to={`/store/${product.slug}`} className="block flex-1 group/link">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-base line-clamp-1 group-hover/link:text-primary transition-colors">
                            {product.name?.ar || product.name?.en}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {product.short_description || 'لا يوجد وصف مختصر لهذا المنتج.'}
                        </p>
                      </Link>

                      {/* التذييل: السعر وزر الإضافة */}
                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          {isFree ? (
                            <span className="text-lg font-black text-green-500">مجاني</span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-lg font-black text-primary">${finalPrice}</span>
                              {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">${product.pricing?.price}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <Button 
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={addingToCart[product.id]}
                          className={`h-10 px-4 rounded-xl shadow-md transition-all duration-300 ${
                            addingToCart[product.id] 
                              ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' 
                              : 'gradient-bg text-white shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5'
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {addingToCart[product.id] ? (
                              <motion.div key="checked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Check className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline-block">أضف</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </div>
                    </div>

                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}