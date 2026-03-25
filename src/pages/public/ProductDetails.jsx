import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, ShoppingCart, Eye, Download, ChevronRight, 
  Star, Tag as TagIcon, Check, Shield, Truck, Package, Zap, Hash, Timer, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { publicAPI, customerAPI } from '@/api/services';
import useAuthStore from '@/store/authStore';
import FavoriteButton from '@/components/ui/favorite-button';

export default function ProductDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  
  // 🟢 المؤقت الذكي: يحمل نوع المؤقت والوقت المتبقي
  const [timerInfo, setTimerInfo] = useState({ type: null, time: null });
  
  const { isAuthenticated } = useAuthStore();
  
  // 🟢 القفل لمنع تكرار الطلب في بيئة التطوير (Development)
  const lastFetchedSlug = useRef(null);

  useEffect(() => { 
    // التأكد من عدم تكرار الطلب لنفس المنتج في نفس اللحظة
    if (lastFetchedSlug.current === slug) return;
    lastFetchedSlug.current = slug;

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
      if (e.response && e.response.status === 404) {
        console.log("المنتج غير موجود أو مخفي");
      } else {
        console.error('Error loading product:', e); 
      }
      setData(null);
    } finally { 
      setLoading(false); 
    }
  };

  // 🟢 محرك المؤقت التنازلي المزدوج (للبداية والنهاية)
  useEffect(() => {
    const pricing = data?.product?.pricing;
    if (!pricing || pricing.offer_type === 'none') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startTime = pricing.offer_start ? new Date(pricing.offer_start).getTime() : 0;
      const endTime = pricing.offer_end ? new Date(pricing.offer_end).getTime() : 0;

      let targetTime = 0;
      let type = null;

      // هل العرض في المستقبل؟
      if (startTime > now) {
        targetTime = startTime;
        type = 'starts_in';
      } 
      // هل العرض نشط حالياً؟
      else if (endTime > now || (!endTime && startTime <= now)) {
        targetTime = endTime; // إذا كان لا يوجد نهاية، سيتوقف المؤقت لاحقاً
        type = 'ends_in';
      }

      if (type && targetTime > 0) {
        const distance = targetTime - now;
        if (distance < 0) {
          setTimerInfo({ type: null, time: null });
        } else {
          setTimerInfo({
            type: type,
            time: {
              days: Math.floor(distance / (1000 * 60 * 60 * 24)),
              hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
              seconds: Math.floor((distance % (1000 * 60)) / 1000)
            }
          });
        }
      } else {
        setTimerInfo({ type: null, time: null });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.product]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return toast.error('يرجى تسجيل الدخول أولاً للإضافة إلى السلة');
    setAdding(true);
    try {
      toast.success('تمت الإضافة إلى السلة بنجاح', {
        icon: <ShoppingCart className="w-4 h-4 text-green-500" />
      });
    } catch (e) { 
      toast.error('حدث خطأ أثناء الإضافة'); 
    } finally { 
      setTimeout(() => setAdding(false), 1500); 
    }
  };

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
          </div>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center px-4" dir="rtl">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-md">عذراً، يبدو أن المنتج الذي تبحث عنه قد تم حذفه أو أن الرابط غير صحيح.</p>
        <Link to="/store">
          <Button className="rounded-xl h-12 px-8">العودة للمتجر <ChevronRight className="w-4 h-4 mr-2" /> </Button>
        </Link>
      </div>
    );
  }

  const product = data.product;
  const related = data.related || [];
  
  // 🟢 حساب السعر النهائي: الخصم يطبق *فقط* إذا كان وقت العرض قد بدأ ولم ينتهِ (ends_in) أو عرض دائم بدأ فعلاً
  const pricing = product.pricing;
  const isOfferActive = timerInfo.type === 'ends_in' || (pricing?.offer_type !== 'none' && !pricing?.offer_start && !timerInfo.type);
  
  const isFree = isOfferActive && (pricing?.offer_type === 'free' || pricing?.is_free);
  const hasDiscount = isOfferActive && pricing?.offer_type === 'discount' && pricing?.discount_value > 0;
  
  let finalPrice = pricing?.price || 0;
  if (isFree) {
    finalPrice = 0;
  } else if (hasDiscount) {
    if (pricing.discount_type === 'percentage') {
      finalPrice = Math.max(0, +(pricing.price * (1 - pricing.discount_value / 100)).toFixed(2));
    } else {
      finalPrice = Math.max(0, +(pricing.price - pricing.discount_value).toFixed(2));
    }
  }

  const allImages = [product.media?.thumbnail, ...(product.media?.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background/50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-4 py-2 rounded-xl backdrop-blur-sm">
            <ChevronRight className="w-4 h-4" /> العودة للمتجر
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-card border border-border/50 shadow-sm relative group">
              {allImages.length > 0 ? (
                <img src={allImages[activeImage]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full gradient-bg opacity-5 flex items-center justify-center"><ShoppingBag className="w-24 h-24 text-primary/40" /></div>
              )}
              
              <div className="absolute top-4 right-4 z-10"><FavoriteButton item={product} type="product" /></div>

              {/* 🟢 الشارة تظهر فقط إذا كان العرض نشطاً */}
              {isOfferActive && isFree && (
                <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0 shadow-lg text-sm px-3 py-1">مجاني 🎁</Badge>
              )}
              {isOfferActive && hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-lg text-sm px-3 py-1">
                  خصم {pricing.discount_type === 'percentage' ? `${pricing.discount_value}%` : `$${pricing.discount_value}`}
                </Badge>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary shadow-md scale-105' : 'border-transparent hover:border-primary/50'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7 flex flex-col">
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className={`gap-1.5 py-1 ${product.product_type === 'digital' ? 'text-purple-600 border-purple-200 bg-purple-500/5' : 'text-amber-600 border-amber-200 bg-amber-500/5'}`}>
                {product.product_type === 'digital' ? <Download className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                {product.product_type === 'digital' ? 'منتج رقمي' : 'منتج قابل للشحن'}
              </Badge>
              {product.is_featured && <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"><Star className="w-3 h-3 fill-current" /> مميز</Badge>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">{product.name?.ar || product.name?.en}</h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">{product.short_description || 'لا يوجد وصف مختصر متوفر لهذا المنتج.'}</p>

            {/* السعر وزر الإضافة */}
            <div className="mb-6 p-6 rounded-3xl bg-card border border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">السعر النهائي</p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {isFree ? (
                    <span className="text-5xl font-black text-green-500 tracking-tight">مجاني</span>
                  ) : (
                    <>
                      <span className="text-5xl font-black text-primary tracking-tight">${finalPrice}</span>
                      {hasDiscount && <span className="text-2xl text-muted-foreground line-through opacity-70">${pricing?.price}</span>}
                    </>
                  )}
                </div>
              </div>

              <Button onClick={handleAddToCart} disabled={adding} className={`h-14 px-8 rounded-2xl text-base font-bold shadow-xl transition-all sm:w-auto w-full ${adding ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/25' : 'gradient-bg text-white shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1'}`}>
                <AnimatePresence mode="wait">
                  {adding ? <motion.div key="checked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2"><Check className="w-5 h-5" /> تمت الإضافة</motion.div> : <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> أضف إلى السلة</motion.div>}
                </AnimatePresence>
              </Button>
            </div>

            {/* 🟢 عرض المؤقتات (الترقب قبل البداية - الاستعجال قبل النهاية) */}
            {timerInfo.time && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                className={`mb-8 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  timerInfo.type === 'starts_in' 
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' // لون أزرق للترقب
                  : 'bg-red-500/10 border-red-500/20 text-red-600'   // لون أحمر للاستعجال
                }`}
              >
                <div className="flex items-center gap-2">
                  {timerInfo.type === 'starts_in' ? <Clock className="w-5 h-5" /> : <Timer className="w-5 h-5 animate-pulse" />}
                  <span className="text-sm font-bold">
                    {timerInfo.type === 'starts_in' ? 'ترقبوا! سيبدأ العرض بعد:' : 'أسرع! ينتهي هذا العرض خلال:'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-center" dir="ltr">
                  {timerInfo.time.days > 0 && <><div className="flex flex-col min-w-[40px]"><span className="text-xl font-black">{timerInfo.time.days}</span><span className="text-[10px] font-bold">يوم</span></div><span className="text-xl font-black mb-3">:</span></>}
                  <div className="flex flex-col min-w-[40px]"><span className="text-xl font-black">{timerInfo.time.hours.toString().padStart(2, '0')}</span><span className="text-[10px] font-bold">ساعة</span></div>
                  <span className="text-xl font-black mb-3">:</span>
                  <div className="flex flex-col min-w-[40px]"><span className="text-xl font-black">{timerInfo.time.minutes.toString().padStart(2, '0')}</span><span className="text-[10px] font-bold">دقيقة</span></div>
                  <span className="text-xl font-black mb-3">:</span>
                  <div className="flex flex-col min-w-[40px]"><span className="text-xl font-black">{timerInfo.time.seconds.toString().padStart(2, '0')}</span><span className="text-[10px] font-bold">ثانية</span></div>
                </div>
              </motion.div>
            )}

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><TagIcon className="w-4 h-4 text-primary" /> الخصائص</h3>
                  <div className="space-y-2">
                    {Object.entries(product.attributes).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/30 text-sm">
                        <span className="text-muted-foreground">{key}</span><span className="font-bold text-foreground">{typeof val === 'boolean' ? (val ? 'نعم' : 'لا') : val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">{product.product_type === 'digital' ? <Shield className="w-4 h-4 text-purple-500" /> : <Truck className="w-4 h-4 text-amber-500" />} طريقة التسليم</h3>
                {product.product_type === 'digital' ? (
                   <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-sm"><p className="font-bold text-purple-700 dark:text-purple-400 mb-1">تسليم فوري وآمن</p><p className="text-muted-foreground text-xs leading-relaxed">بمجرد إتمام الدفع، سيتم إرسال رابط التحميل مباشرة إلى بريدك الإلكتروني. المنتج محمي وآمن 100%.</p></div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm space-y-2"><div className="flex justify-between items-center"><span className="font-bold text-amber-700 dark:text-amber-400">التوفر في المخزون:</span><Badge variant="outline" className="bg-background text-xs">{product.physical_info?.stock_quantity > 0 ? 'متوفر' : 'نفد الكمية'}</Badge></div><p className="text-muted-foreground text-xs leading-relaxed">{product.shipping?.shipping_note || 'يتم تجهيز وشحن الطلب في أسرع وقت ممكن.'}</p></div>
                )}
              </div>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8 pt-6 border-t border-border/50">
                <Hash className="w-4 h-4 text-muted-foreground" />
                {product.tags.map((tag, idx) => <Badge key={idx} variant="secondary" className="font-normal bg-muted/50 hover:bg-muted text-xs">{tag}</Badge>)}
              </div>
            )}

            <div className="mt-auto flex items-center gap-6 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {product.stats?.views_count || 0} زائر شاهد هذا المنتج</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> {product.stats?.sales_count || 0} عملية شراء</span>
            </div>

          </motion.div>
        </div>

        {(product.description?.ar || product.description?.en) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-16">
            <Card className="p-6 sm:p-10 border-border/50 shadow-sm rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><div className="w-1.5 h-6 bg-primary rounded-full" />وصف المنتج التفصيلي</h2>
              <div className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-loose">{product.description?.ar || product.description?.en}</div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}