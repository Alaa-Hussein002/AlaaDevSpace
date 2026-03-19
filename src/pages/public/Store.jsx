import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Tag, Eye, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { publicAPI } from '@/api/services';
import FavoriteButton from '@/components/ui/favorite-button';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const name = p.name?.ar || p.name?.en || '';
    return name.includes(search);
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <ShoppingBag className="w-3 h-3 ml-1" />
            المتجر
          </Badge>
          <h1 className="text-4xl font-bold mb-3">
            المتجر <span className="gradient-text">الرقمي</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            قوالب، أكواد مصدرية، وأدوات رقمية احترافية جاهزة للاستخدام
          </p>
        </motion.div>

        {/* البحث */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="ابحث عن منتج..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 h-11 bg-card border-border" />
          </div>
        </motion.div>

        {/* المنتجات */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد منتجات حالياً</p>
            <p className="text-xs text-muted-foreground/60 mt-1">سيتم إضافة المنتجات قريباً</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={`/store/${product.slug}`}>
                  <Card className="overflow-hidden card-hover group border-border/50 bg-card/80">
                    <div className="absolute bottom-3 left-3">
                      <FavoriteButton item={product} type="product" />
                    </div>
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {product.media?.thumbnail ? (
                        <img src={product.media.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full gradient-bg opacity-15 flex items-center justify-center">
                          <ShoppingBag className="w-10 h-10 text-primary/30" />
                        </div>
                      )}
                      {product.is_on_sale && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-[10px]">
                          خصم {product.pricing?.discount_percentage}%
                        </Badge>
                      )}
                      <Badge className="absolute top-3 right-3 bg-card/90 text-foreground border-0 text-[10px]">
                        {product.product_type === 'digital' ? 'رقمي' : 'ملموس'}
                      </Badge>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name?.ar || product.name?.en}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {product.short_description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          {product.pricing?.is_free ? (
                            <span className="text-lg font-bold text-green-500">مجاني</span>
                          ) : (
                            <>
                              <span className="text-lg font-bold text-primary">${product.pricing?.price}</span>
                              {product.pricing?.compare_at_price > product.pricing?.price && (
                                <span className="text-xs text-muted-foreground line-through">${product.pricing?.compare_at_price}</span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{product.stats?.views_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}