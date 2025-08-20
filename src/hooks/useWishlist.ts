import { useState, useEffect } from 'react';
import { WishlistState, WishlistItem } from '../types';

const STORAGE_KEY = 'movieWishlist';

const initialState: WishlistState = {
  toWatch: [],
  watched: []
};

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistState>(initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
      }
    }
  }, []);

  const saveToStorage = (newWishlist: WishlistState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWishlist));
    setWishlist(newWishlist);
  };

  const addToWishlist = (item: WishlistItem, list: 'toWatch' | 'watched') => {
    const newWishlist = {
      ...wishlist,
      [list]: [...wishlist[list], { ...item, dateAdded: new Date().toISOString() }]
    };
    saveToStorage(newWishlist);
  };

  const removeFromWishlist = (itemId: string, list: 'toWatch' | 'watched') => {
    const newWishlist = {
      ...wishlist,
      [list]: wishlist[list].filter(item => item.id !== itemId)
    };
    saveToStorage(newWishlist);
  };

  const moveItem = (itemId: string, from: 'toWatch' | 'watched', to: 'toWatch' | 'watched') => {
    const item = wishlist[from].find(item => item.id === itemId);
    if (!item) return;

    const newWishlist = {
      ...wishlist,
      [from]: wishlist[from].filter(item => item.id !== itemId),
      [to]: [...wishlist[to], item]
    };
    saveToStorage(newWishlist);
  };

  const updateEpisodes = (itemId: string, watchedEpisodes: number[], currentEpisode: number, totalEpisodes?: number, totalSeasons?: number) => {
    const updateList = (list: WishlistItem[]) =>
      list.map(item =>
        item.id === itemId
          ? {
              ...item,
              watchedEpisodes,
              currentEpisode,
              ...(totalEpisodes && { totalEpisodes }),
              ...(totalSeasons && { totalSeasons })
            }
          : item
      );

    const newWishlist = {
      toWatch: updateList(wishlist.toWatch),
      watched: updateList(wishlist.watched)
    };
    saveToStorage(newWishlist);
  };

  const isInWishlist = (itemId: string): { inToWatch: boolean; inWatched: boolean } => {
    return {
      inToWatch: wishlist.toWatch.some(item => item.id === itemId),
      inWatched: wishlist.watched.some(item => item.id === itemId)
    };
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    moveItem,
    updateEpisodes,
    isInWishlist
  };
};