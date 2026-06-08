import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto py-4 scrollbar-none w-full max-w-7xl mx-auto px-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-28 h-10 rounded-xl bg-slate-800/40 animate-pulse border border-white/5"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-2">
      {/* Category Chips Container */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto py-3 scrollbar-none scroll-smooth -mx-4 px-4">
        
        {/* 'All' Chip */}
        <button
          onClick={() => setActiveCategory('')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide border transition-all duration-300 ${
            activeCategory === ''
              ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-slate-700'
          }`}
        >
          <span>🌐</span>
          <span>All Tools</span>
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((category) => {
          const isSelected = activeCategory === category.slug || activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide border transition-all duration-300 group"
              style={{
                borderColor: isSelected 
                  ? category.color 
                  : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isSelected 
                  ? `${category.color}20` 
                  : 'rgba(255, 255, 255, 0.05)',
                color: isSelected 
                  ? category.color 
                  : '#cbd5e1'
              }}
            >
              <span className="group-hover:scale-110 transition-transform duration-200">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
