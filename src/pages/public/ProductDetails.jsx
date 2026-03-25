import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, ShoppingCart, Eye, Download, ChevronRight, 
  Star, Tag as TagIcon, Check, Shield, Truck, Package, Zap, Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { publicAPI, customerAPI } from '@/api/services';
import useAuthStore from '@/store/authStore';
import FavoriteButton from '@/components/ui/favorite-button';

/* ============================================ */
/* دالة حساب السعر النهائي                     */
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

export default function ProductDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0); // للتحكم بمعرض الصور
  const { isAuthenticated } = useAuthStore();

  useEffect(() => { 
    // إعادة تعيين الصفحة عند تغير الـ slug (مثلاً عند الضغط على منتج مشابه)
    window.scrollTo(0, 0);
    setActiveImage(0);
    loadProduct(); 
  }, [slug]);

    const loadProduct = async () => {
    try {
      setLoading(true);
      const decodedSlug = decodeURIComponent(slug);
      
      const res = await publicAPI.getProduct(decodedSlug);
      const responseData = res.data?.data;

      if (responseData && responseData.product) {
        setData({ 
          product: responseData.product, 
          related: responseData.related || [] 
        });
      } else {
        setData(null);
      }

    } catch (e) { 
      // 🟢 إذا كان الخطأ 404 (المنتج غير موجود أو مخفي)، لا داعي لطباعة الخطأ المزعج
      if (e.response && e.response.status === 404) {
        console.log("المنتج غير موجود أو تم إخفاؤه.");
      } else {
        // طباعة الأخطاء الأخرى فقط (مثل توقف السيرفر)
        console.error('Error loading product:', e); 
      }
      
      setData(null); // هذا السطر سيجعل الشاشة تعرض "المنتج غير موجود" بأناقة
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return toast.error('يرجى تسجيل الدخول أولاً للإضافة إلى السلة');
    setAdding(true);
    try {
      // TODO: استبدل هذا بربط الـ Cart الحقيقي
      // await customerAPI.addToCart({ product_id: data.product.id });
      toast.success('تمت الإضافة إلى السلة بنجاح', {
        icon: <ShoppingCart className="w-4 h-4 text-green-500" />
      });
    } catch (e) { 
      toast.error(e.response?.data?.message || 'حدث خطأ أثناء الإضافة'); 
    } finally { 
      setTimeout(() => setAdding(false), 1500); 
    }
  };

  // حالة التحميل (Skeleton Loader)
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto" dir="rtl">
        <div className="mb-6 h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5 h-[400px] lg:h-[500px] bg-muted animate-pulse rounded-3xl" />
          <div className="lg:col-span-7 space-y-6">
            <div className="h-10 bg-muted animate-pulse rounded-xl w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            <div className="h-16 bg-muted animate-pulse rounded-2xl w-1/3 mt-8" />
            <div className="h-14 bg-muted animate-pulse rounded-2xl w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  // حالة المنتج غير موجود
  if (!data?.product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center px-4" dir="rtl">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          عذراً، يبدو أن المنتج الذي تبحث عنه قد تم حذفه أو أن الرابط غير صحيح.
        </p>
        <Link to="/store">
          <Button className="rounded-xl h-12 px-8">
            العودة للمتجر <ChevronRight className="w-4 h-4 mr-2" /> 
          </Button>
        </Link>
      </div>
    );
  }

  const product = data.product;
  const related = data.related || [];
  
  // حسابات السعر والعروض
  const isFree = product.pricing?.offer_type === 'free' || product.pricing?.is_free;
  const hasDiscount = product.pricing?.offer_type === 'discount' && product.pricing?.discount_value > 0;
  const finalPrice = calculateFinalPrice(product.pricing);

  // تجميع كل الصور (الرئيسية + المعرض) لتسهيل التنقل
  const allImages = [
    product.media?.thumbnail, 
    ...(product.media?.gallery || [])
  ].filter(Boolean); // إزالة القيم الفارغة

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background/50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* مسار التنقل (Breadcrumb) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-4 py-2 rounded-xl backdrop-blur-sm">
            <ChevronRight className="w-4 h-4" /> العودة للمتجر
          </Link>
        </motion.div>

        {/* القسم العلوي: الصورة والتفاصيل */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* 1. قسم الصور */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-card border border-border/50 shadow-sm relative group">
              {allImages.length > 0 ? (
                <img 
                  src={allImages[activeImage]} 
                  alt={product.name?.ar} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full gradient-bg opacity-5 flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-primary/40" />
                </div>
              )}
              
              <div className="absolute top-4 right-4 z-10">
                <FavoriteButton item={product} type="product" />
              </div>

              {/* شارة الخصم على الصورة */}
              {isFree ? (
                <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0 shadow-lg text-sm px-3 py-1">
                  مجاني 🎁
                </Badge>
              ) : hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-lg text-sm px-3 py-1">
                  خصم {product.pricing.discount_type === 'percentage' ? `${product.pricing.discount_value}%` : `$${product.pricing.discount_value}`}
                </Badge>
              )}
            </div>

            {/* معرض الصور المصغرة (Gallery) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-primary shadow-md scale-105' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* 2. قسم التفاصيل */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7 flex flex-col">
            
            {/* الشارات العلوية */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className={`gap-1.5 py-1 ${
                product.product_type === 'digital' ? 'text-purple-600 border-purple-200 bg-purple-500/5' : 'text-amber-600 border-amber-200 bg-amber-500/5'
              }`}>
                {product.product_type === 'digital' ? <Download className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                {product.product_type === 'digital' ? 'منتج رقمي' : 'منتج قابل للشحن'}
              </Badge>
              {product.is_featured && (
                <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                  <Star className="w-3 h-3 fill-current" /> مميز
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              {product.name?.ar || product.name?.en}
            </h1>
            
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              {product.short_description || 'لا يوجد وصف مختصر متوفر لهذا المنتج.'}
            </p>

            {/* السعر */}
            <div className="mb-8 p-6 rounded-3xl bg-card border border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">السعر النهائي</p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {isFree ? (
                    <span className="text-5xl font-black text-green-500 tracking-tight">مجاني</span>
                  ) : (
                    <>
                      <span className="text-5xl font-black text-primary tracking-tight">${finalPrice}</span>
                      {hasDiscount && (
                        <span className="text-2xl text-muted-foreground line-through opacity-70">${product.pricing?.price}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* زر الإضافة للسلة */}
              <Button 
                size="lg"
                onClick={handleAddToCart} 
                disabled={adding}
                className={`h-14 px-8 rounded-2xl text-base font-bold shadow-xl transition-all sm:w-auto w-full ${
                  adding 
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/25' 
                    : 'gradient-bg text-white shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1'
                }`}
              >
                <AnimatePresence mode="wait">
                  {adding ? (
                    <motion.div key="checked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                      <Check className="w-5 h-5" /> تمت الإضافة
                    </motion.div>
                  ) : (
                    <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" /> أضف إلى السلة
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            {/* الخصائص والوسوم (تنسيق شبكي) */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              
              {/* الخصائص (Attributes) */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><TagIcon className="w-4 h-4 text-primary" /> الخصائص</h3>
                  <div className="space-y-2">
                    {Object.entries(product.attributes).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/30 text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-bold text-foreground">{typeof val === 'boolean' ? (val ? 'نعم' : 'لا') : val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات الشحن أو التنزيل */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  {product.product_type === 'digital' ? <Shield className="w-4 h-4 text-purple-500" /> : <Truck className="w-4 h-4 text-amber-500" />} 
                  طريقة التسليم
                </h3>
                
                {product.product_type === 'digital' ? (
                   <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-sm">
                     <p className="font-bold text-purple-700 dark:text-purple-400 mb-1">تسليم فوري وآمن</p>
                     <p className="text-muted-foreground text-xs leading-relaxed">بمجرد إتمام الدفع، سيتم إرسال رابط التحميل مباشرة إلى بريدك الإلكتروني. المنتج محمي وآمن 100%.</p>
                   </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm space-y-2">
                     <div className="flex justify-between items-center">
                       <span className="font-bold text-amber-700 dark:text-amber-400">التوفر في المخزون:</span>
                       <Badge variant="outline" className="bg-background text-xs">{product.physical_info?.stock_quantity > 0 ? 'متوفر' : 'نفد الكمية'}</Badge>
                     </div>
                     <p className="text-muted-foreground text-xs leading-relaxed">
                       {product.shipping?.shipping_note || 'يتم تجهيز وشحن الطلب في أسرع وقت ممكن.'}
                     </p>
                  </div>
                )}
              </div>

            </div>

            {/* الوسوم (Tags) */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8 pt-6 border-t border-border/50">
                <Hash className="w-4 h-4 text-muted-foreground" />
                {product.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="font-normal bg-muted/50 hover:bg-muted text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* الإحصائيات أسفل الصفحة */}
            <div className="mt-auto flex items-center gap-6 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {product.stats?.views_count || 0} زائر شاهد هذا المنتج</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> {product.stats?.sales_count || 0} عملية شراء</span>
            </div>

          </motion.div>
        </div>

        {/* ======================================= */}
        {/* القسم السفلي: الوصف الكامل والمنتجات المشابهة */}
        {/* ======================================= */}
        
        {/* الوصف الكامل */}
        {(product.description?.ar || product.description?.en) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-16">
            <Card className="p-6 sm:p-10 border-border/50 shadow-sm rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                وصف المنتج التفصيلي
              </h2>
              <div className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-loose">
                {product.description?.ar || product.description?.en}
              </div>
            </Card>
          </motion.div>
        )}

        {/* منتجات مشابهة */}
        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                قد يعجبك أيضاً
              </h2>
              <Link to="/store" className="text-sm font-bold text-primary hover:underline">عرض الكل</Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <Link key={p.id} to={`/store/${p.slug}`}>
                  <Card className="h-full flex flex-col overflow-hidden group border-border/50 bg-card/60 hover:border-primary/30 transition-all hover:shadow-lg rounded-2xl">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {p.media?.thumbnail ? (
                        <img src={p.media.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-primary/20" /></div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{p.name?.ar || p.name?.en}</h3>
                      <div className="mt-auto pt-2">
                        <span className="text-base font-black text-primary">${calculateFinalPrice(p.pricing)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}