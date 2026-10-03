import { useState, useRef, useEffect } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import { BlogTag } from '../types/blog.types';
import { blogApi } from '../api/blogApi';

interface TagInputProps {
  selectedTags: BlogTag[];
  onChange: (tags: BlogTag[]) => void;
}

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<BlogTag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const allTags = await blogApi.getTags(inputValue);
      // Filter out already selected tags
      const unselected = allTags.filter((t) => !selectedTags.some((st) => st.id === t.id));
      setSuggestions(unselected);
    };
    fetchSuggestions();
  }, [inputValue, selectedTags]);

  const addTag = async (name: string) => {
    const clean = name.trim();
    if (!clean) return;

    // Check if already selected
    if (selectedTags.some((t) => t.nameAr.toLowerCase() === clean.toLowerCase())) {
      setInputValue('');
      return;
    }

    // Try finding in suggestions or create
    const match = suggestions.find((t) => t.nameAr.toLowerCase() === clean.toLowerCase());
    if (match) {
      onChange([...selectedTags, match]);
    } else {
      const created = await blogApi.createTag(clean);
      onChange([...selectedTags, created]);
    }

    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (id: string) => {
    onChange(selectedTags.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag
      removeTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <TagIcon className="w-4 h-4 text-emerald-600" />
          <span>الوسوم والكلمات الدلالية (Tags)</span>
        </label>
        <span className="text-[10px] text-slate-400">اضغط Enter للإضافة</span>
      </div>

      {/* Chips Container */}
      <div className="min-h-[42px] p-2 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-wrap gap-1.5 items-center relative focus-within:border-emerald-500 focus-within:bg-white transition-all">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs group"
          >
            <span>{tag.nameAr}</span>
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="text-emerald-500 hover:text-rose-600 p-0.5 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? 'اكتب وسمًا واضغط Enter...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-800 focus:outline-none py-1 px-1"
        />

        {/* Add button for mobile/touch */}
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="px-2 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>إضافة</span>
          </button>
        )}
      </div>

      {/* Auto Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-lg space-y-1 max-h-40 overflow-y-auto text-xs">
          <p className="text-[10px] text-slate-400 font-bold px-2 py-0.5">وسوم شائعة مقترحة:</p>
          <div className="flex flex-wrap gap-1.5 p-1">
            {suggestions.slice(0, 10).map((sug) => (
              <button
                key={sug.id}
                type="button"
                onClick={() => {
                  onChange([...selectedTags, sug]);
                  setInputValue('');
                  setShowSuggestions(false);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-colors text-xs font-medium"
              >
                + {sug.nameAr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
