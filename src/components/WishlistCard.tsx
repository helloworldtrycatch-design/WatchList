import React from 'react';
import { Star, Calendar, Trash2, CheckCircle, RotateCcw, Film, Tv, Play } from 'lucide-react';
import { WishlistItem } from '../types';

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onMove?: (id: string) => void;
  onOpenEpisodeModal?: (item: WishlistItem) => void;
  showMoveButton?: boolean;
  moveButtonText?: string;
  moveButtonIcon?: 'right' | 'left';
}

export const WishlistCard: React.FC<WishlistCardProps> = ({
  item,
  onRemove,
  onMove,
  onOpenEpisodeModal,
  showMoveButton,
  moveButtonText,
  moveButtonIcon
}) => {
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
    <div className="group relative bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl overflow-hidden hover:bg-white/10 hover:border-gray-600/50 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-poster.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Type Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 bg-gradient-to-r ${getTypeColor(item.type)} rounded-full text-white text-xs font-medium flex items-center gap-1 shadow-lg`}>
          {getTypeIcon(item.type)}
          <span className="capitalize">{item.type}</span>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showMoveButton && onMove && (
            <button
              onClick={() => onMove(item.id)}
              className={`p-2 ${moveButtonIcon === 'right' ? 'bg-green-500/90 hover:bg-green-500' : 'bg-blue-500/90 hover:bg-blue-500'} text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110`}
              title={moveButtonText}
            >
              {moveButtonIcon === 'right' ? <CheckCircle size={16} /> : <RotateCcw size={16} />}
            </button>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Remove from list"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-200">
          {item.title}
        </h3>
        
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-400">
          {item.year && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {item.year}
            </span>
          )}
          {item.rating && (
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
          {item.description || 'No description available.'}
        </p>
        
        {/* Episode Progress for TV shows and Anime */}
        {(item.type === 'tv' || item.type === 'anime') && (
          <div className="mt-4">
            {item.watchedEpisodes && item.totalEpisodes ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-purple-400 font-medium">
                    {item.watchedEpisodes.length}/{item.totalEpisodes} episodes
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.watchedEpisodes.length / item.totalEpisodes) * 100}%` }}
                  />
                </div>
              </div>
            ) : null}
            
            {onOpenEpisodeModal && (
              <button
                onClick={() => onOpenEpisodeModal(item)}
                className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-200 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play size={14} />
                Track Episodes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};