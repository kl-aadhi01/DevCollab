import React from 'react';

const MilestoneCard = ({ milestone, onStatusChange, isEditable }) => {
  const statusColors = {
    pending: 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-textPrimary">{milestone.title}</h4>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusColors[milestone.status]}`}>
            {milestone.status}
          </span>
        </div>
        {milestone.description && (
          <p className="text-xs text-textSecondary mt-1 leading-relaxed">
            {milestone.description}
          </p>
        )}
        {milestone.targetDate && (
          <p className="text-[10px] text-textSecondary mt-2">
            Target: {new Date(milestone.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {isEditable && (
        <div className="flex items-center gap-2 self-end sm:self-center">
          <select
            value={milestone.status}
            onChange={(e) => onStatusChange(milestone.title, e.target.value)}
            className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default MilestoneCard;
