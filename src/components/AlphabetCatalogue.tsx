import React, { useState, useMemo } from 'react';
import { WishlistItem } from '../types';
import { WishlistCard } from './WishlistCard';

interface AlphabetCatalogueProps {
  items: WishlistItem[];
  onRemove: (id: string, list: 'toWatch' | 'watched') => void;
  onMove: (id: string, from: 'toWatch' | 'watched', to: 'toWatch' | 'watched') => void;
}

export const AlphabetCatalogue: React.FC<AlphabetCatalogueProps> = ({
  items,
  onRemove,
  onMove
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const groupedItems = useMemo(() => {
    const groups: Record<string, WishlistItem[]> = {};

    alphabet.forEach(letter => {
      groups[letter] = items.filter(item =>
        item.title.toUpperCase().startsWith(letter)
      ).sort((a, b) => a.title.localeCompare(b.title));
    });

    return groups;
  }, [items]);

  const availableLetters = alphabet.filter(letter => groupedItems[letter].length > 0);

  return (
    <div className="space-y-6">
      {/* Alphabet Navigation */}
      <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 text-center">A-Z Catalogue</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {alphabet.map(letter => {
            const isAvailable = availableLetters.includes(letter);
            const isSelected = selectedLetter === letter;

            return (
              <button
                type="button"
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                disabled={!isAvailable}
                className={`w-10 h-10 rounded-lg font-bold transition-all duration-200 ${isSelected
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                  : isAvailable
                    ? 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                    : 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items for Selected Letter */}
      <div>
        {groupedItems[selectedLetter].length > 0 ? (
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                {selectedLetter}
              </span>
              <span className="text-gray-400 text-lg">
                ({groupedItems[selectedLetter].length} {groupedItems[selectedLetter].length === 1 ? 'item' : 'items'})
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {groupedItems[selectedLetter].map(item => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={(id) => onRemove(id, 'toWatch')} // Assuming these are from toWatch list
                  showMoveButton={false}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl font-bold text-gray-700 mb-4">{selectedLetter}</div>
            <p className="text-gray-400 text-lg">No titles starting with "{selectedLetter}"</p>
          </div>
        )}
      </div>
    </div>
  );
};