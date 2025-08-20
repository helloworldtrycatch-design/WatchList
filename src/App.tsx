import React, { useEffect, useState } from 'react';
import { Film, Eye, Clock, List, Search as SearchIcon, Star, Shuffle, Menu, X } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { SearchModal } from './components/SearchModal';
import { WishlistCard } from './components/WishlistCard';
import { EpisodeModal } from './components/EpisodeModal';
import { AlphabetCatalogue } from './components/AlphabetCatalogue';
import { RandomPicker } from './components/RandomPicker';
import { useWishlist } from './hooks/useWishlist';
import { searchMovies, searchTV, getImageUrl } from './services/tmdb';
import { searchAnime } from './services/jikan';
import { SearchResult, WishlistItem } from './types';

type View = 'search' | 'toWatch' | 'watched' | 'catalogue' | 'random';

function App() {
  const [currentView, setCurrentView] = useState<View>('search');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { wishlist, addToWishlist, removeFromWishlist, moveItem, updateEpisodes, isInWishlist } = useWishlist();

  const handleOpenEpisodeModal = (item: WishlistItem) => {
    setSelectedItem(item);
    setIsEpisodeModalOpen(true);
  };

  const handleCloseEpisodeModal = () => {
    setIsEpisodeModalOpen(false);
    setSelectedItem(null);
  };

  const handleSearch = async (
    query: string,
    type: 'movie' | 'tv' | 'anime',
    region?: 'hollywood' | 'bollywood'
  ) => {
    setIsLoading(true);
    try {
      let results: SearchResult[] = [];

      if (type === 'anime') {
        const animeResults = await searchAnime(query);
        results = animeResults.data
          .filter(item => item.images?.jpg?.image_url) // Filter out items without posters
          .map(item => ({
            id: `anime_${item.mal_id}`,
            title: item.title_english || item.title,
            description: item.synopsis || 'No description available.',
            poster: item.images.jpg.image_url,
            type: 'anime' as const,
            year: item.aired?.from ? new Date(item.aired.from).getFullYear().toString() : undefined,
            rating: item.score || undefined,
            originalId: item.mal_id
          }));
      } else if (type === 'movie') {
        const movieResults = await searchMovies(query, region === 'bollywood' ? 'IN' : undefined);
        results = movieResults.results
          .filter(item => item.poster_path) // Filter out items without posters
          .map(item => ({
            id: `movie_${item.id}`,
            title: item.title || item.name || 'Unknown Title',
            description: item.overview,
            poster: getImageUrl(item.poster_path),
            type: 'movie' as const,
            year: item.release_date ? new Date(item.release_date).getFullYear().toString() : undefined,
            rating: item.vote_average > 0 ? item.vote_average : undefined,
            originalId: item.id
          }));
      } else if (type === 'tv') {
        const tvResults = await searchTV(query);
        results = tvResults.results
          .filter(item => item.poster_path) // Filter out items without posters
          .map(item => ({
            id: `tv_${item.id}`,
            title: item.title || item.name || 'Unknown Title',
            description: item.overview,
            poster: getImageUrl(item.poster_path),
            type: 'tv' as const,
            year: item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : undefined,
            rating: item.vote_average > 0 ? item.vote_average : undefined,
            originalId: item.id
          }));
      }

      setSearchResults(results);
      setIsSearchModalOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigationItems = [
    { key: 'search' as const, label: 'Search', icon: SearchIcon },
    { key: 'random' as const, label: 'Random', icon: Shuffle },
    { key: 'toWatch' as const, label: 'To Watch', icon: Clock },
    { key: 'watched' as const, label: 'Watched', icon: Eye },
    { key: 'catalogue' as const, label: 'A-Z', icon: List }
  ];

  const allItems = [...wishlist.toWatch, ...wishlist.watched];

  // Keep the selected item in sync with wishlist updates so the modal reflects changes immediately
  useEffect(() => {
    if (!selectedItem) return;
    const updatedItem =
      wishlist.toWatch.find(i => i.id === selectedItem.id) ||
      wishlist.watched.find(i => i.id === selectedItem.id) ||
      null;
    if (updatedItem) {
      setSelectedItem(updatedItem);
    }
  }, [wishlist, selectedItem?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-gray-900/95 to-purple-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Film className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">CinemaWish</h1>
                  <p className="text-sm text-gray-400">Your personal movie & anime wishlist</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{allItems.length} total items</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-6 relative">
              {/* Mobile hamburger button */}
              <div className="md:hidden flex justify-end mb-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Desktop navigation */}
              <div className="hidden md:flex flex-wrap gap-2">
                {navigationItems.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${currentView === key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 hover:scale-105'
                      }`}
                  >
                    <Icon size={18} />
                    {label}
                    {key === 'toWatch' && wishlist.toWatch.length > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {wishlist.toWatch.length}
                      </span>
                    )}
                    {key === 'watched' && wishlist.watched.length > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {wishlist.watched.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile navigation menu */}
              {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl mt-2 p-4 shadow-2xl z-50">
                  <div className="space-y-2">
                    {navigationItems.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setCurrentView(key);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 ${currentView === key
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                          }`}
                      >
                        <Icon size={18} />
                        <span className="flex-1 text-left">{label}</span>
                        {key === 'toWatch' && wishlist.toWatch.length > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {wishlist.toWatch.length}
                          </span>
                        )}
                        {key === 'watched' && wishlist.watched.length > 0 && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            {wishlist.watched.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {currentView === 'search' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">
                  Discover Your Next
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"> Favorite</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Search through millions of movies, TV shows, and anime to build your perfect watchlist
                </p>
              </div>

              <SearchBar onSearch={handleSearch} isLoading={isLoading} />

              <div className="text-center text-gray-500">
                <p className="text-sm">
                  💡 Tip: Use Hollywood/Bollywood filters for better regional results
                </p>
              </div>
            </div>
          )}

          {currentView === 'random' && (
            <RandomPicker
              onAddToWishlist={addToWishlist}
              isInWishlist={isInWishlist}
              toWatchList={wishlist.toWatch}
            />
          )}
          {currentView === 'toWatch' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">To Watch</h2>
                <p className="text-gray-400">
                  {wishlist.toWatch.length} {wishlist.toWatch.length === 1 ? 'item' : 'items'} waiting for you
                </p>
              </div>

              {wishlist.toWatch.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {wishlist.toWatch.map(item => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      onRemove={(id) => removeFromWishlist(id, 'toWatch')}
                      onMove={(id) => moveItem(id, 'toWatch', 'watched')}
                      onOpenEpisodeModal={handleOpenEpisodeModal}
                      showMoveButton
                      moveButtonText="Mark as watched"
                      moveButtonIcon="right"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Your to-watch list is empty</p>
                  <p className="text-gray-500 text-sm mt-2">Search for movies, shows, or anime to add them here</p>
                </div>
              )}
            </div>
          )}

          {currentView === 'watched' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Watched</h2>
                <p className="text-gray-400">
                  {wishlist.watched.length} {wishlist.watched.length === 1 ? 'item' : 'items'} completed
                </p>
              </div>

              {wishlist.watched.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {wishlist.watched.map(item => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      onRemove={(id) => removeFromWishlist(id, 'watched')}
                      onMove={(id) => moveItem(id, 'watched', 'toWatch')}
                      onOpenEpisodeModal={handleOpenEpisodeModal}
                      showMoveButton
                      moveButtonText="Move back to watchlist"
                      moveButtonIcon="left"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No watched items yet</p>
                  <p className="text-gray-500 text-sm mt-2">Items you mark as watched will appear here</p>
                </div>
              )}
            </div>
          )}

          {currentView === 'catalogue' && (
            <AlphabetCatalogue
              items={allItems}
              onRemove={removeFromWishlist}
              onMove={moveItem}
            />
          )}
        </main>

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          results={searchResults}
          onAddToWishlist={addToWishlist}
          isInWishlist={isInWishlist}
        />

        {/* Episode Modal */}
        {selectedItem && (
          <EpisodeModal
            isOpen={isEpisodeModalOpen}
            onClose={handleCloseEpisodeModal}
            item={selectedItem}
            onUpdateEpisodes={updateEpisodes}
          />
        )}
      </div>
    </div>
  );
}

export default App;