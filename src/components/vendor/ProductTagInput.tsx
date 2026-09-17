import React, { useState, KeyboardEvent } from 'react';
import { Plus, X, Tag } from 'lucide-react';

interface ProductTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

const COMMON_SUGGESTIONS = [
  'Fresh Dairy & Milk',
  'Organic Spices',
  'Bakery & Bread',
  'Seafood & Fish',
  'Fresh Vegetables & Fruits',
  'Rice & Grains',
  'Cooking Oils & Ghee',
  'Snacks & Beverages',
  'Cleaning & Hygiene',
  'Frozen Foods',
  'Personal Care'
];

export const ProductTagInput: React.FC<ProductTagInputProps> = ({
  value = [],
  onChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (rawTag: string) => {
    const trimmed = rawTag.trim().replace(/^,+|,+$/g, '');
    if (!trimmed) return;

    if (!value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag
      onChange(value.slice(0, -1));
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2.5">
      {/* Input Box and Active Chips Container */}
      <div
        className={`min-h-[52px] p-2 bg-white rounded-xl border transition-all duration-150 flex flex-wrap items-center gap-2 ${
          error
            ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
            : 'border-slate-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100'
        }`}
      >
        {/* Rendered Chips */}
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in group shadow-xs"
          >
            <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[200px]">{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(idx)}
              className="text-emerald-500 hover:text-red-600 p-0.5 rounded-md hover:bg-emerald-100 transition-colors"
              title="Remove product"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        {/* Input Field */}
        <div className="flex-1 flex items-center min-w-[160px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) {
                handleAddTag(inputValue);
              }
            }}
            placeholder={
              value.length === 0
                ? 'Type item name / category & press Enter...'
                : 'Add more products...'
            }
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none px-2 py-1"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => handleAddTag(inputValue)}
              className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 transition-colors shrink-0"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Suggested Quick Add Tags */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Quick suggestions (click to add):</span>
          <span className="text-[11px] text-slate-400">
            {value.length} added
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SUGGESTIONS.map((item) => {
            const isAdded = value.some(
              (t) => t.toLowerCase() === item.toLowerCase()
            );
            return (
              <button
                key={item}
                type="button"
                disabled={isAdded}
                onClick={() => handleAddTag(item)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                  isAdded
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 shadow-xs'
                }`}
              >
                {!isAdded && <Plus className="w-2.5 h-2.5 text-emerald-600" />}
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
