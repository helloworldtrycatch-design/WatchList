import React, { useState } from 'react';
import { Shuffle, Sparkles, Heart, Laugh, Zap, Sword, Ghost, Drama, List } from 'lucide-react';
import { searchMovies, searchTV, getImageUrl } from '../services/tmdb';
import { searchAnime } from '../services/jikan';
import { SearchResult, WishlistItem } from '../types';

interface RandomPickerProps {
  onAddToWishlist: (item: any, list: 'toWatch' | 'watched') => void;
  isInWishlist: (itemId: string) => { inToWatch: boolean; inWatched: boolean };
  toWatchList: WishlistItem[];
}

const genres = [
  { id: 'any', name: 'Surprise Me!', icon: Sparkles, color: 'from-rainbow-500 to-rainbow-600', tmdbId: null },
  { id: 'comedy', name: 'Comedy', icon: Laugh, color: 'from-yellow-500 to-orange-500', tmdbId: 35 },
  { id: 'romance', name: 'Romance', icon: Heart, color: 'from-pink-500 to-red-500', tmdbId: 10749 },
  { id: 'action', name: 'Action', icon: Zap, color: 'from-red-500 to-orange-500', tmdbId: 28 },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles, color: 'from-purple-500 to-pink-500', tmdbId: 14 },
  { id: 'adventure', name: 'Adventure', icon: Sword, color: 'from-green-500 to-blue-500', tmdbId: 12 },
  { id: 'horror', name: 'Horror', icon: Ghost, color: 'from-gray-700 to-black', tmdbId: 27 },
  { id: 'drama', name: 'Drama', icon: Drama, color: 'from-blue-500 to-purple-500', tmdbId: 18 }
];

export const RandomPicker: React.FC<RandomPickerProps> = ({ onAddToWishlist, isInWishlist, toWatchList }) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [pickSource, setPickSource] = useState<'discover' | 'watchlist'>('discover');
  const [randomPick, setRandomPick] = useState<SearchResult | null>(null);
  const [watchlistPick, setWatchlistPick] = useState<WishlistItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRandomPick = async () => {
    setIsLoading(true);
    setRandomPick(null);
    setWatchlistPick(null);
    
    try {
      if (pickSource === 'watchlist') {
        let filteredItems = toWatchList;
        
        if (selectedType !== ('any' as any)) {
          filteredItems = toWatchList.filter(item => item.type === selectedType);
        }
        
        if (filteredItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredItems.length);
          setWatchlistPick(filteredItems[randomIndex]);
        } else {
          setWatchlistPick(null);
        }
        setIsLoading(false);
        return;
      }
      
      let results: SearchResult[] = [];

      if (selectedType === 'anime') {
        let animeResults;
        if (selectedGenre === 'any' || !selectedGenre) {
          animeResults = await fetch('https://api.jikan.moe/v4/top/anime?limit=25&page=' + (Math.floor(Math.random() * 10) + 1));
          const data = await animeResults.json();
          animeResults = { data: data.data };
        } else {
          const genre = genres.find(g => g.id === selectedGenre);
          animeResults = await searchAnime(genre?.name || 'anime');
        }
        results = animeResults.data.map(item => ({
          id: `anime_${item.mal_id}`,
          title: item.title_english || item.title,
          description: item.synopsis || 'No description available.',
          poster: item.images.jpg.image_url,
          type: 'anime' as const,
          year: item.aired?.from ? new Date(item.aired.from).getFullYear().toString() : undefined,
          rating: item.score || undefined,
          originalId: item.mal_id
        }));
      } else {
        const endpoint = selectedType === 'movie' ? 'discover/movie' : 'discover/tv';
        let url = `https://api.themoviedb.org/3/${endpoint}?api_key=1af5c9dacbfde032a6ac8b2ca5666e5d&sort_by=popularity.desc&page=${Math.floor(Math.random() * 5) + 1}`;
        
        if (selectedGenre && selectedGenre !== 'any') {
          const genre = genres.find(g => g.id === selectedGenre);
          if (genre?.tmdbId) {
            url += `&with_genres=${genre.tmdbId}`;
          }
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        results = data.results
          .filter((item: any) => item.poster_path)
          .map((item: any) => ({
          id: `${selectedType}_${item.id}`,
          title: item.title || item.name || 'Unknown Title',
          description: item.overview,
          poster: getImageUrl(item.poster_path),
          type: selectedType,
          year: item.release_date || item.first_air_date ? 
            new Date(item.release_date || item.first_air_date).getFullYear().toString() : undefined,
          rating: item.vote_average > 0 ? item.vote_average : undefined,
          originalId: item.id
        }));
      }

      if (results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        setRandomPick(results[randomIndex]);
      }
    } catch (error) {
      console.error('Error getting random pick:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = (list: 'toWatch' | 'watched') => {
    if (!randomPick) return;
    
    const item = {
      id: randomPick.id,
      title: randomPick.title,
      description: randomPick.description,
      poster: randomPick.poster,
      type: randomPick.type,
      year: randomPick.year,
      rating: randomPick.rating,
      originalId: randomPick.originalId,
      dateAdded: new Date().toISOString()
    };
    
    onAddToWishlist(item, list);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">
          Random
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"> Picker</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Can't decide what to watch? Let us pick something from new discoveries or your watchlist!
        </p>
      </div>

      {/* Source Selection */}
      <div className="flex justify-center">
        <div className="flex bg-white/10 backdrop-blur-sm rounded-xl border border-gray-600/50 overflow-hidden">
          <button
            onClick={() => setPickSource('discover')}
            className={`px-6 py-3 font-medium transition-all duration-200 flex items-center gap-2 ${
              pickSource === 'discover'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles size={18} />
            Discover New
          </button>
          <button
            onClick={() => setPickSource('watchlist')}
            className={`px-6 py-3 font-medium transition-all duration-200 flex items-center gap-2 ${
              pickSource === 'watchlist'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <List size={18} />
            From My List ({toWatchList.length})
          </button>
        </div>
      </div>

      {/* Type Selection */}
      {pickSource === 'watchlist' && (
        <div className="flex justify-center">
          <div className="flex bg-white/10 backdrop-blur-sm rounded-xl border border-gray-600/50 overflow-hidden">
            <button
              onClick={() => setSelectedType('any' as any)}
              className={`px-6 py-3 font-medium transition-all duration-200 ${
                selectedType === ('any' as any)
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              All Types ({toWatchList.length})
            </button>
            <button
              onClick={() => setSelectedType('movie')}
              className={`px-6 py-3 font-medium transition-all duration-200 capitalize ${
                selectedType === 'movie'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Movies ({toWatchList.filter(item => item.type === 'movie').length})
            </button>
            <button
              onClick={() => setSelectedType('tv')}
              className={`px-6 py-3 font-medium transition-all duration-200 capitalize ${
                selectedType === 'tv'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              TV Shows ({toWatchList.filter(item => item.type === 'tv').length})
            </button>
            <button
              onClick={() => setSelectedType('anime')}
              className={`px-6 py-3 font-medium transition-all duration-200 capitalize ${
                selectedType === 'anime'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Anime ({toWatchList.filter(item => item.type === 'anime').length})
            </button>
          </div>
        </div>
      )}

      {pickSource === 'discover' && (
        <div className="flex bg-white/10 backdrop-blur-sm rounded-xl border border-gray-600/50 overflow-hidden">
          {(['movie', 'tv', 'anime'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-3 font-medium transition-all duration-200 capitalize ${
                selectedType === type
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {type === 'tv' ? 'TV Shows' : type}
            </button>
          ))}
        </div>
      )}

      {/* Genre Selection */}
      {pickSource === 'discover' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {genres.map((genre) => {
          const Icon = genre.icon;
          return (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`p-6 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 ${
                selectedGenre === genre.id
                  ? `bg-gradient-to-r ${genre.color} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white/5 border-gray-600/50 text-gray-300 hover:bg-white/10 hover:border-gray-500/50 hover:scale-105'
              }`}
            >
              <Icon size={24} />
              <span className="font-medium text-sm">{genre.name}</span>
            </button>
          );
        })}
        </div>
      )}

      {/* Pick Button */}
      <div className="text-center">
        <button
          onClick={getRandomPick}
          disabled={isLoading || (pickSource === 'watchlist' && toWatchList.length === 0)}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center gap-3 mx-auto"
        >
          <Shuffle size={20} />
          {isLoading 
            ? 'Finding your perfect match...' 
            : pickSource === 'watchlist' 
              ? 'Pick from My List!' 
              : selectedGenre 
                ? 'Pick Something Random!' 
                : 'Surprise Me!'
          }
        </button>
        
        {pickSource === 'watchlist' && toWatchList.length === 0 && (
          <p className="text-gray-400 text-sm mt-2">Add items to your watchlist first!</p>
        )}
      </div>

      {/* Random Pick Card */}
      {randomPick && (
        <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
              <img
                src={randomPick.poster}
                alt={randomPick.title}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-poster.jpg';
                }}
              />
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{randomPick.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="capitalize bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                      {randomPick.type}
                    </span>
                    {randomPick.year && <span>{randomPick.year}</span>}
                    {randomPick.rating && (
                      <span className="flex items-center gap-1">
                        ⭐ {randomPick.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-4">
                {randomPick.description || 'No description available.'}
              </p>

              <div className="flex gap-3">
                {(() => {
                  const { inToWatch, inWatched } = isInWishlist(randomPick.id);
                  return (
                    <>
                      <button
                        onClick={() => handleAddToList('toWatch')}
                        disabled={inToWatch}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                          inToWatch
                            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        {inToWatch ? 'Already in To Watch' : 'Add to To Watch'}
                      </button>
                      
                      <button
                        onClick={() => handleAddToList('watched')}
                        disabled={inWatched}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                          inWatched
                            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        {inWatched ? 'Already Watched' : 'Mark as Watched'}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {pickSource === 'watchlist' && toWatchList.length > 0 && !watchlistPick && !isLoading && (
        <p className="text-gray-400 text-sm mt-2">Click the button above to pick a random title from your watchlist!</p>
      )}
    </div>
  );
};