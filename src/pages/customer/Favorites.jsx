import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, FolderOpen, FileText, Trash2, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFavoritesStore from '@/store/favoritesStore';

const typeConfig = {
  product: { icon: ShoppingBag, label: 'المنتجات', path: '/store', color: 'text-purple-500' },
  project: { icon: FolderOpen, label: 'المشاريع', path: '/projects', color: 'text-blue-500' },
  article: { icon: FileText, label: 'المقالات', path: '/blog', color: 'text-green-500' },
  game: { icon: Gamepad2, label: 'الألعاب', path: '/games', color: 'text-red-500' },
};

export default function Favorites() {
  const { favorites, removeFavorite, getFavoritesByType } = useFavoritesStore();
  const types = ['product', 'project', 'article', 'game'];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Heart className="w-6 h-6 text-red-500" /> المفضلة</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">لا توجد عناصر في المفضلة</p>
            <p className="text-xs text-muted-foreground/60">أضف المنتجات والمشاريع والمقالات التي تعجبك</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="bg-muted/50 mb-6">
              <TabsTrigger value="all" className="text-xs">الكل ({favorites.length})</TabsTrigger>
              {types.map((t) => {
                const count = getFavoritesByType(t).length;
                if (count === 0) return null;
                const Icon = typeConfig[t].icon;
                return <TabsTrigger key={t} value={t} className="text-xs"><Icon className="w-3 h-3 ml-1" /> {typeConfig[t].label} ({count})</TabsTrigger>;
              })}
            </TabsList>

            <TabsContent value="all">
              <FavoritesList items={favorites} onRemove={removeFavorite} />
            </TabsContent>
            {types.map((t) => (
              <TabsContent key={t} value={t}>
                <FavoritesList items={getFavoritesByType(t)} onRemove={removeFavorite} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}

function FavoritesList({ items, onRemove }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const config = typeConfig[item.type] || typeConfig.product;
        const Icon = config.icon;
        const path = item.type === 'product' ? `/store/${item.slug}` : item.type === 'project' ? `/projects/${item.slug}` : item.type === 'article' ? `/blog/${item.slug}` : '/games';

        return (
          <motion.div key={`${item.id}-${item.type}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                  {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Icon className={`w-6 h-6 ${config.color} opacity-40`} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-sm truncate">{item.title}</h3>
                    <Badge variant="secondary" className="text-[9px]">{config.label}</Badge>
                  </div>
                  {item.price && <p className="text-sm font-bold text-primary">${item.price}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link to={path}><Button variant="outline" size="sm" className="rounded-lg text-xs">عرض</Button></Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onRemove(item.id, item.type)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}