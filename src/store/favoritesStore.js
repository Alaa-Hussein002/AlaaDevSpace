import { create } from 'zustand';

const useFavoritesStore = create((set, get) => ({
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),

  addFavorite: (item) => {
    const { favorites } = get();
    if (favorites.find((f) => f.id === item.id && f.type === item.type)) return;
    const updated = [...favorites, { ...item, addedAt: new Date().toISOString() }];
    localStorage.setItem('favorites', JSON.stringify(updated));
    set({ favorites: updated });
  },

  removeFavorite: (id, type) => {
    const updated = get().favorites.filter((f) => !(f.id === id && f.type === type));
    localStorage.setItem('favorites', JSON.stringify(updated));
    set({ favorites: updated });
  },

  isFavorite: (id, type) => {
    return get().favorites.some((f) => f.id === id && f.type === type);
  },

  getFavoritesByType: (type) => {
    return get().favorites.filter((f) => f.type === type);
  },
}));

export default useFavoritesStore;