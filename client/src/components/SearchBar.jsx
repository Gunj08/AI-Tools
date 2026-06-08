import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, placeholder = "Search from 100+ AI tools (e.g. ChatGPT, coding, writing...)" }) => {
  
  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        
        {/* Glow border overlay */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 opacity-20 blur group-hover:opacity-35 transition-all duration-300"></div>

        {/* Input container */}
        <div className="relative flex items-center bg-[#111827]/90 rounded-2xl border border-white/10 group-hover:border-purple-500/20 shadow-xl overflow-hidden transition-all duration-300">
          
          {/* Search Icon */}
          <div className="pl-4 text-slate-400 group-hover:text-purple-400 transition-colors duration-200">
            <Search className="w-5 h-5" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-4 sm:py-4.5 bg-transparent border-none text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-sm sm:text-base font-medium"
          />

          {/* Clear button if text exists */}
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-2 mr-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search CTA */}
          <button 
            type="button"
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium px-5 py-2.5 rounded-xl mr-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
          >
            Find
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
