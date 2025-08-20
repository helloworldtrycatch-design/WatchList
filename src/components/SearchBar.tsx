import React, { useState } from 'react';
import { Search, Film, Tv, Play, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, type: 'movie' | 'tv' | 'anime', region?: 'hollywood' | 'bollywood') => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [region, setRegion] = useState<'hollywood' | 'bollywood'>('hollywood');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType, searchType === 'anime' ? undefined : region);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };
  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, TV shows, or anime..."
            className={`w-full pl-12 py-4 bg-white/10 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg ${
              query ? 'pr-12' : 'pr-4'
            }`}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex flex-col sm:flex-row bg-white/10 backdrop-blur-sm rounded-xl border border-gray-600/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setSearchType('movie')}
              className={`px-4 sm:px-6 py-3 flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                searchType === 'movie'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Film size={18} />
              Movies
            </button>
            <button
              type="button"
              onClick={() => setSearchType('tv')}
              className={`px-4 sm:px-6 py-3 flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                searchType === 'tv'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Tv size={18} />
              TV Shows
            </button>
            <button
              type="button"
              onClick={() => setSearchType('anime')}
              className={`px-4 sm:px-6 py-3 flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                searchType === 'anime'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Play size={18} />
              Anime
            </button>
          </div>

          {searchType !== 'anime' && (
            <div className="flex flex-col sm:flex-row bg-white/10 backdrop-blur-sm rounded-xl border border-gray-600/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setRegion('hollywood')}
                className={`px-4 sm:px-6 py-3 font-medium transition-all duration-200 ${
                  region === 'hollywood'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Hollywood
              </button>
              <button
                type="button"
                onClick={() => setRegion('bollywood')}
                className={`px-4 sm:px-6 py-3 font-medium transition-all duration-200 ${
                  region === 'bollywood'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Bollywood
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );
};