import React, { useState, useEffect } from 'react';
import { X, Check, Play, Tv, Calendar, Clock, Star, Edit3, Save } from 'lucide-react';
import { WishlistItem } from '../types';

interface EpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WishlistItem;
  onUpdateEpisodes: (itemId: string, watchedEpisodes: number[], currentEpisode: number, totalEpisodes?: number, totalSeasons?: number) => void;
}

export const EpisodeModal: React.FC<EpisodeModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdateEpisodes
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTotalEpisodes, setTempTotalEpisodes] = useState(item.totalEpisodes || 12);
  const [tempTotalSeasons, setTempTotalSeasons] = useState(item.totalSeasons || 1);

  const watchedEpisodes = item.watchedEpisodes || [];
  const currentEpisode = item.currentEpisode || 1;
  const totalEpisodes = item.totalEpisodes || 12;
  const totalSeasons = item.totalSeasons || 1;

  useEffect(() => {
    if (isOpen) {
      setTempTotalEpisodes(totalEpisodes);
      setTempTotalSeasons(totalSeasons);
      setIsEditing(false);
    }
  }, [isOpen, totalEpisodes, totalSeasons]);

  const toggleEpisode = (episodeNumber: number) => {
    let newWatchedEpisodes;
    let newCurrentEpisode = currentEpisode;

    if (watchedEpisodes.includes(episodeNumber)) {
      // Remove episode from watched
      newWatchedEpisodes = watchedEpisodes.filter(ep => ep !== episodeNumber);
      // Update current episode to the highest unwatched episode before this one, or 1
      const remainingEpisodes = newWatchedEpisodes.sort((a, b) => a - b);
      newCurrentEpisode = remainingEpisodes.length > 0 ? Math.max(...remainingEpisodes) + 1 : 1;
      if (newCurrentEpisode > totalEpisodes) newCurrentEpisode = totalEpisodes;
    } else {
      // Add episode to watched
      newWatchedEpisodes = [...watchedEpisodes, episodeNumber].sort((a, b) => a - b);
      // Update current episode to next unwatched episode
      newCurrentEpisode = episodeNumber + 1;
      if (newCurrentEpisode > totalEpisodes) newCurrentEpisode = totalEpisodes;
    }

    onUpdateEpisodes(item.id, newWatchedEpisodes, newCurrentEpisode, totalEpisodes, totalSeasons);
  };

  // Removed bulk actions per UX request; progress updates should reflect immediately via parent state sync

  const saveEpisodeCount = () => {
    const newTotalEpisodes = Math.max(1, tempTotalEpisodes);
    const newTotalSeasons = Math.max(1, tempTotalSeasons);

    // Filter watched episodes to only include valid episode numbers
    const validWatchedEpisodes = watchedEpisodes.filter(ep => ep <= newTotalEpisodes);
    const newCurrentEpisode = Math.min(currentEpisode, newTotalEpisodes);

    onUpdateEpisodes(item.id, validWatchedEpisodes, newCurrentEpisode, newTotalEpisodes, newTotalSeasons);
    setIsEditing(false);
  };

  const progressPercentage = (watchedEpisodes.length / totalEpisodes) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-2 sm:mx-4 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={item.poster}
              alt={item.title}
              className="w-12 h-16 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-poster.jpg';
              }}
            />
            <div>
              <h2 className="text-xl font-bold text-white">{item.title}</h2>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="capitalize">{item.type}</span>
                {item.year && <span>{item.year}</span>}
                {item.rating && (
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    {item.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
            aria-label="Close"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Play size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">Episode Progress</h3>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                  <span className="flex items-center gap-2">
                    <Tv size={16} />
                    {watchedEpisodes.length}/{totalEpisodes} episodes
                  </span>
                  {totalSeasons > 1 && (
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      {totalSeasons} seasons
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {progressPercentage.toFixed(0)}% complete
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                title="Edit episode count"
              >
                <Edit3 size={16} />
              </button>
            </div>

            {/* Manual Episode/Season Input */}
            {isEditing && (
              <div className="mb-4 p-4 bg-black/20 rounded-lg border border-gray-600/30">
                <h4 className="text-white font-medium mb-3">Edit Episode Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="totalEpisodesInput" className="block text-sm text-gray-300 mb-2">Total Episodes</label>
                    <input
                      id="totalEpisodesInput"
                      type="number"
                      min="1"
                      max="9999"
                      value={tempTotalEpisodes}
                      onChange={(e) => setTempTotalEpisodes(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 12"
                      title="Total number of episodes"
                    />
                  </div>
                  <div>
                    <label htmlFor="totalSeasonsInput" className="block text-sm text-gray-300 mb-2">Total Seasons</label>
                    <input
                      id="totalSeasonsInput"
                      type="number"
                      min="1"
                      max="99"
                      value={tempTotalSeasons}
                      onChange={(e) => setTempTotalSeasons(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 1"
                      title="Total number of seasons"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={saveEpisodeCount}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setTempTotalEpisodes(totalEpisodes);
                      setTempTotalSeasons(totalSeasons);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Control Buttons removed as per new UX */}
          </div>

          {/* Episode Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-white">Episodes</h4>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
                  <span>Watched</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded ring-2 ring-purple-400"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/10 border border-gray-600 rounded"></div>
                  <span>Unwatched</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-3 max-h-80 overflow-y-auto p-4 bg-black/20 rounded-xl border border-gray-700/30">
              {Array.from({ length: totalEpisodes }, (_, i) => {
                const episodeNumber = i + 1;
                const isWatched = watchedEpisodes.includes(episodeNumber);
                const isCurrent = episodeNumber === currentEpisode && !isWatched;

                return (
                  <button
                    key={episodeNumber}
                    onClick={() => toggleEpisode(episodeNumber)}
                    className={`aspect-square rounded-xl text-sm font-bold transition-all duration-200 hover:scale-110 relative shadow-lg ${isWatched
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25 hover:shadow-green-500/40'
                        : isCurrent
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 ring-2 ring-purple-400 hover:shadow-purple-500/40'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-gray-600/50 hover:border-gray-500 hover:shadow-white/10'
                      }`}
                    title={
                      isWatched
                        ? `Episode ${episodeNumber} - Watched`
                        : isCurrent
                          ? `Episode ${episodeNumber} - Current Episode`
                          : `Episode ${episodeNumber} - Click to mark as watched`
                    }
                  >
                    {episodeNumber}
                    {isWatched && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Messages */}
          {watchedEpisodes.length > 0 && currentEpisode <= totalEpisodes && (
            <div className="mt-6 text-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <p className="text-purple-300 font-medium text-lg">
                🎬 Ready to watch Episode {currentEpisode}
              </p>
            </div>
          )}

          {watchedEpisodes.length === totalEpisodes && (
            <div className="mt-6 text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <p className="text-green-300 font-medium text-lg">
                🎉 Congratulations! You've completed this {item.type === 'anime' ? 'anime' : 'series'}!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};