import React from 'react';
import Avatar from '../common/Avatar';

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all space-y-3">
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-xs font-bold text-textPrimary leading-snug">{task.title}</h4>
        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="text-textSecondary hover:text-error text-xs font-bold transition-colors"
        >
          &times;
        </button>
      </div>

      {task.description && (
        <p className="text-[10px] text-textSecondary leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex justify-between items-center pt-2">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {task.assignedTo ? (
          <div title={`Assigned to ${task.assignedTo.name}`}>
            <Avatar user={task.assignedTo} size="xs" />
          </div>
        ) : (
          <span className="text-[9px] font-semibold text-textSecondary italic">Unassigned</span>
        )}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between">
        <label className="text-[9px] text-textSecondary font-bold">Status:</label>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-[10px] font-bold border border-border rounded px-1.5 py-1 bg-white outline-none"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="done">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;
