import React from 'react';

const BootcampFilter = ({ filters, setFilters }) => {
  const categories = ['all', 'frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data-science', 'cloud'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  const handleCategoryChange = (cat) => {
    setFilters(prev => ({
      ...prev,
      category: cat === 'all' ? '' : cat
    }));
  };

  const handleLevelChange = (lvl) => {
    setFilters(prev => ({
      ...prev,
      level: lvl === 'all' ? '' : lvl
    }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-8 flex flex-col gap-6">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="Search bootcamps by title, description, or topics..."
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Categories Toggle */}
      <div>
        <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isActive = (!filters.category && cat === 'all') || filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-textSecondary border-border hover:bg-slate-50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Levels Toggle */}
      <div>
        <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Difficulty Level</h4>
        <div className="flex gap-2">
          {levels.map(lvl => {
            const isActive = (!filters.level && lvl === 'all') || filters.level === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : 'bg-white text-textSecondary border-border hover:bg-slate-50'
                }`}
              >
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BootcampFilter;
