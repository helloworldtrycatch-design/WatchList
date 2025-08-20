import { useState, useEffect } from 'react';
import { WishlistState, WishlistItem, SeasonProgress } from '../types';

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
        const parsed: WishlistState = JSON.parse(saved);
        // Migrate existing items to season-wise structure if needed
        const migrateItem = (item: WishlistItem): WishlistItem => {
          if (item.seasons && item.seasons.length > 0) return item;
          const totalSeasons = item.totalSeasons && item.totalSeasons > 0 ? item.totalSeasons : 1;
          const totalEpisodes = item.totalEpisodes && item.totalEpisodes > 0 ? item.totalEpisodes : 12;
          const watchedEpisodes = Array.isArray(item.watchedEpisodes) ? item.watchedEpisodes : [];
          const seasons: SeasonProgress[] = Array.from({ length: totalSeasons }, (_, idx) => ({
            seasonNumber: idx + 1,
            totalEpisodes: idx === 0 ? totalEpisodes : 12,
            watchedEpisodes: idx === 0 ? watchedEpisodes : []
          }));
          return {
            ...item,
            seasons,
            currentSeason: item.currentSeason || 1,
            currentEpisode: item.currentEpisode || Math.min((watchedEpisodes[watchedEpisodes.length - 1] || 0) + 1, totalEpisodes)
          };
        };
        const migrated: WishlistState = {
          toWatch: parsed.toWatch.map(migrateItem),
          watched: parsed.watched.map(migrateItem)
        };
        setWishlist(migrated);
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

  const updateEpisodesSeasonWise = (
    itemId: string,
    seasonNumber: number,
    watchedEpisodes: number[],
    currentEpisode: number,
    totalEpisodes?: number,
    totalSeasons?: number
  ) => {
    const updateList = (list: WishlistItem[]) =>
      list.map(item => {
        if (item.id !== itemId) return item;
        const existingSeasons: SeasonProgress[] = item.seasons && item.seasons.length > 0
          ? item.seasons
          : [{ seasonNumber: 1, totalEpisodes: item.totalEpisodes || 12, watchedEpisodes: item.watchedEpisodes || [] }];

        let seasons = existingSeasons.map(s => ({ ...s }));
        const idx = seasons.findIndex(s => s.seasonNumber === seasonNumber);
        if (idx >= 0) {
          seasons[idx].watchedEpisodes = watchedEpisodes;
          if (typeof totalEpisodes === 'number' && totalEpisodes > 0) {
            seasons[idx].totalEpisodes = totalEpisodes;
            // Clamp watched to totalEpisodes
            seasons[idx].watchedEpisodes = seasons[idx].watchedEpisodes.filter(ep => ep <= totalEpisodes);
          }
        } else {
          seasons.push({ seasonNumber, totalEpisodes: totalEpisodes || 12, watchedEpisodes });
          seasons = seasons.sort((a, b) => a.seasonNumber - b.seasonNumber);
        }

        // Adjust number of seasons if provided
        if (typeof totalSeasons === 'number' && totalSeasons > 0) {
          if (totalSeasons < seasons.length) {
            seasons = seasons.slice(0, totalSeasons);
          } else if (totalSeasons > seasons.length) {
            for (let s = seasons.length + 1; s <= totalSeasons; s++) {
              seasons.push({ seasonNumber: s, totalEpisodes: 12, watchedEpisodes: [] });
            }
          }
        }

        return {
          ...item,
          seasons,
          currentSeason: seasonNumber,
          currentEpisode
        };
      });

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
    updateEpisodesSeasonWise,
    isInWishlist
  };
};