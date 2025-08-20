export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  poster: string;
  type: 'movie' | 'tv' | 'anime';
  year?: string;
  rating?: number;
  region?: 'hollywood' | 'bollywood';
  originalId: number;
  dateAdded: string;
  totalEpisodes?: number;
  watchedEpisodes?: number[];
  currentEpisode?: number;
  totalSeasons?: number;
}

export interface WishlistState {
  toWatch: WishlistItem[];
  watched: WishlistItem[];
}

export type SearchResult = {
  id: string;
  title: string;
  description: string;
  poster: string;
  type: 'movie' | 'tv' | 'anime';
  year?: string;
  rating?: number;
  originalId: number;
};