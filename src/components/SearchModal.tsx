import React from 'react';
import { X, Plus, Star, Calendar, Film, Tv, Play } from 'lucide-react';
import { SearchResult, WishlistItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResult[];
  onAddToWishlist: (item: WishlistItem, list: 'toWatch' | 'watched') => void;
  isInWishlist: (itemId: string) => { inToWatch: boolean; inWatched: boolean };
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  results,
  onAddToWishlist,
  isInWishlist
}) => {
  if (!isOpen) return null;

  const handleAddToList = (result: SearchResult, list: 'toWatch' | 'watched') => {
    const item: WishlistItem = {
      id: result.id,
      title: result.title,
      description: result.description,
      poster: result.poster,
      type: result.type,
      year: result.year,
      rating: result.rating,
      originalId: result.originalId,
      dateAdded: new Date().toISOString()
    };
    onAddToWishlist(item, list);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie': return <Film size={14} />;
      case 'tv': return <Tv size={14} />;
      case 'anime': return <Play size={14} />;
      default: return <Film size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movie': return 'from-blue-500 to-cyan-500';
      case 'tv': return 'from-green-500 to-emerald-500';
      case 'anime': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-2 sm:mx-4 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Search Results</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {results.map((result) => {
                const { inToWatch, inWatched } = isInWishlist(result.id);
                
                return (
                  <div
                    key={result.id}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={result.poster}
                        alt={result.title}
                        className="w-20 h-30 sm:w-24 sm:h-36 object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-poster.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 text-center sm:text-left">{result.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="capitalize bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                              {result.type}
                            </span>
                            {result.year && (
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {result.year}
                              </span>
                            )}
                            {result.rating && (
                              <span className="flex items-center gap-1">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                {result.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleAddToList(result, 'toWatch')}
                            disabled={inToWatch}
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                              inToWatch
                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            }`}
                          >
                            <Plus size={16} />
                            {inToWatch ? 'In To Watch' : 'To Watch'}
                          </button>
                          
                          <button
                            onClick={() => handleAddToList(result, 'watched')}
                            disabled={inWatched}
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                              inWatched
                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            }`}
                          >
                            <Plus size={16} />
                            {inWatched ? 'In Watched' : 'Watched'}
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 text-center sm:text-left">
                        {result.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};