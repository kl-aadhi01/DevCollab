import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const TaskForm = ({ members, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error('Task title is required');

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        assignedTo: assignedTo || null,
        priority,
        deadline: deadline ? new Date(deadline) : null
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setDeadline('');
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-border p-4 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-textPrimary uppercase">New Task</h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-error hover:underline focus:outline-none"
        >
          Cancel
        </button>
      </div>

      <div>
        <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Task Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
          placeholder="e.g. Set up auth routes"
          required
        />
      </div>

      <div>
        <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
          className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none resize-none bg-white"
          placeholder="Describe what needs to be done..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Assign To</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-2.5 py-2 border border-border rounded-lg text-xs bg-white outline-none"
          >
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} (@{m.username})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-2.5 py-2 border border-border rounded-lg text-xs bg-white outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg text-xs bg-white outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors shadow-sm disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
};

export default TaskForm;
