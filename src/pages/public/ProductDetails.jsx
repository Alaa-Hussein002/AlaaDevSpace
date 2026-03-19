import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, Eye, Download, ChevronLeft, Star, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { publicAPI, customerAPI } from '@/api/services';
import useAuthStore from '@/store/authStore';

export default function ProductDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => { loadProduct(); }, [slug]);

  const loadProduct = async () => {
    try {
      const { data: res } = await publicAPI.getProduct(slug);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addToCart = async () => {
    if (!isAuthenticated) return toast.error('سجل دخول أولاً للإضافة إلى السلة');
    setAdding(true);
    try {
      await customerAPI.addToCart({ product_id: data.product.id });
      toast.success('تمت الإضافة إلى السلة');
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setAdding(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto" dir="rtl">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-96 bg-muted animate-pulse rounded-2xl" />
          <div className="space-y-4"><div className="h-8 bg-muted animate-pulse rounded w-2/3" /><div className="h-4 bg-muted animate-pulse rounded w-full" /><div className="h-12 bg-muted animate-pulse rounded w-1/3" /></div>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center" dir="rtl">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-4">المنتج غير موجود</p>
        <Link to="/store"><Button variant="outline" className="rounded-xl"><ChevronLeft className="w-4 h-4 ml-2" /> العودة للمتجر</Button></Link>
      </div>
    );
  }

  const product = data.product;
  const related = data.related || [];

  return (
    <div className="min-h-screen pt-24 pb-16" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/store" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> العودة للمتجر</Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* الصورة */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border/50">
              {product.media?.thumbnail ? (
                <img src={product.media.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-bg opacity-15 flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-primary/30" />
                </div>
              )}
            </div>
          </motion.div>

          {/* التفاصيل */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">{product.product_type === 'digital' ? 'منتج رقمي' : 'منتج ملموس'}</Badge>
              {product.is_on_sale && <Badge className="bg-red-500 text-white border-0 text-xs">خصم!</Badge>}
            </div>

            <h1 className="text-3xl font-bold">{product.name?.ar || product.name?.en}</h1>
            <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>

            {/* السعر */}
            <div className="flex items-baseline gap-3">
              {product.pricing?.is_free ? (
                <span className="text-4xl font-bold text-green-500">مجاني</span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-primary">${product.pricing?.price}</span>
                  {product.pricing?.compare_at_price > product.pricing?.price && (
                    <span className="text-xl text-muted-foreground line-through">${product.pricing?.compare_at_price}</span>
                  )}
                </>
              )}
            </div>

            {/* الخصائص */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-2">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium">{typeof val === 'boolean' ? (val ? 'نعم' : 'لا') : val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* الأزرار */}
            <div className="flex gap-3 pt-2">
              <Button onClick={addToCart} disabled={adding} className="flex-1 h-12 gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 text-base">
                <ShoppingCart className="w-5 h-5 ml-2" />
                {adding ? 'جاري الإضافة...' : 'أضف إلى السلة'}
              </Button>
            </div>

            {/* الإحصائيات */}
            <div className="flex gap-6 pt-4 border-t border-border/50 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {product.stats?.views_count || 0} مشاهدة</span>
              <span className="flex items-center gap-1"><Download className="w-4 h-4" /> {product.stats?.sales_count || 0} مبيعة</span>
            </div>
          </motion.div>
        </div>

        {/* الوصف الكامل */}
        {(product.description?.ar || product.description?.en) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
            <Card className="p-8 border-border/50">
              <h2 className="text-xl font-bold mb-4">وصف المنتج</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description?.ar || product.description?.en}</p>
            </Card>
          </motion.div>
        )}

        {/* منتجات مشابهة */}
        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
            <h2 className="text-xl font-bold mb-6">منتجات مشابهة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <Link key={p.id} to={`/store/${p.slug}`}>
                  <Card className="overflow-hidden card-hover border-border/50">
                    <div className="aspect-[4/3] bg-muted">
                      {p.media?.thumbnail ? <img src={p.media.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-bg opacity-10" />}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-xs truncate">{p.name?.ar || p.name?.en}</h3>
                      <p className="text-sm font-bold text-primary mt-1">${p.pricing?.price || 0}</p>
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