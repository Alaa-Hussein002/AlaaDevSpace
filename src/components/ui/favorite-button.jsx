import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useFavoritesStore from '@/store/favoritesStore';

export default function FavoriteButton({ item, type, className = '' }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const liked = isFavorite(item.id, type);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      removeFavorite(item.id, type);
      toast('تم الإزالة من المفضلة');
    } else {
      addFavorite({
        id: item.id,
        type,
        title: item.title?.ar || item.title?.en || item.title || item.name?.ar || item.name?.en || item.name,
        slug: item.slug,
        image: item.cover_image || item.media?.thumbnail || null,
        price: item.pricing?.price || null,
      });
      toast.success('تمت الإضافة للمفضلة ❤️');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 rounded-full ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'} ${className}`}
      onClick={toggle}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
    </Button>
  );
}