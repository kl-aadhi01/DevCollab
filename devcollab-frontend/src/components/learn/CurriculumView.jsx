import React, { useState } from 'react';

const CurriculumView = ({ curriculum, completedWeeks = [], onCompleteWeek, isEnrolled, mentorView = false }) => {
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true });

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [week]: !prev[week]
    }));
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'documentation': return '📚';
      case 'github': return '💻';
      default: return '🔗';
    }
  };

  return (
    <div className="space-y-4">
      {curriculum.map((item) => {
        const isExpanded = !!expandedWeeks[item.week];
        const isCompleted = completedWeeks.includes(item.week);

        return (
          <div 
            key={item.week} 
            className={`border rounded-2xl overflow-hidden transition-all bg-white ${
              isCompleted ? 'border-success/30 bg-emerald-50/10' : 'border-border'
            }`}
          >
            {/* Header */}
            <div
              onClick={() => toggleWeek(item.week)}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isCompleted 
                    ? 'bg-success text-white' 
                    : 'bg-indigo-50 text-primary'
                }`}>
                  {isCompleted ? '✓' : item.week}
                </span>
                <div>
                  <h4 className="font-bold text-textPrimary text-sm sm:text-base">{item.title}</h4>
                  <p className="text-xs text-textSecondary mt-0.5">Week {item.week} Curriculum</p>
                </div>
              </div>
              <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                {isEnrolled && !mentorView && (
                  <button
                    onClick={() => {
                      if (!isCompleted) onCompleteWeek(item.week);
                    }}
                    disabled={isCompleted}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isCompleted
                        ? 'bg-emerald-50 text-success border-success/20 cursor-default'
                        : 'bg-white text-primary border-primary/20 hover:bg-primary hover:text-white'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'Mark Complete'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleWeek(item.week)}
                  className="text-slate-400 text-sm hover:text-textPrimary"
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Details */}
            {isExpanded && (
              <div className="px-5 pb-6 pt-1 border-t border-slate-50 space-y-4">
                <p className="text-sm text-textSecondary leading-relaxed">
                  {item.description}
                </p>

                {/* Topics */}
                {item.topics && item.topics.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Topics Covered</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {item.topics.map((t, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {item.resources && item.resources.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Learning Resources</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.resources.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-slate-50 hover:bg-hoverColor hover:border-primary/30 transition-all text-xs font-bold text-textPrimary"
                        >
                          <span className="text-base">{getResourceIcon(res.type)}</span>
                          <div className="truncate">
                            <p className="truncate leading-none">{res.title}</p>
                            <p className="text-[10px] text-textSecondary uppercase font-semibold mt-0.5">{res.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment Outline */}
                {item.assignment && item.assignment.title && (
                  <div className="p-4 rounded-xl border border-warning/20 bg-amber-50/10">
                    <div className="flex items-center gap-2 text-warning mb-2">
                      <span className="text-lg">📝</span>
                      <h5 className="text-xs font-bold uppercase tracking-wider">Weekly Assignment</h5>
                    </div>
                    <h6 className="text-sm font-bold text-textPrimary">{item.assignment.title}</h6>
                    <p className="text-xs text-textSecondary mt-1 leading-relaxed">{item.assignment.description}</p>
                    {item.assignment.deadline && (
                      <p className="text-[10px] text-textSecondary font-semibold mt-2">
                        Deadline: {new Date(item.assignment.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CurriculumView;
