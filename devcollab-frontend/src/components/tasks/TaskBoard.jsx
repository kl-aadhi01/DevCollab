import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const TaskBoard = ({ projectId, members }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (taskData) => {
    try {
      await API.post('/tasks', { ...taskData, projectId });
      await fetchTasks();
      toast.success('Task created! +10 XP');
      setShowAddForm(false);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      if (newStatus === 'done') {
        toast.success('Task completed! +25 XP');
      } else {
        toast.success('Task status updated');
      }
      // Re-fetch to update user models
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const columns = [
    { id: 'todo', name: 'To Do' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'review', name: 'In Review' },
    { id: 'done', name: 'Completed' }
  ];

  if (loading) {
    return <div className="text-center py-6 text-xs text-textSecondary">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-textPrimary">Project Task Board</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm"
        >
          {showAddForm ? 'Close Editor' : 'Add Task'}
        </button>
      </div>

      {showAddForm && (
        <div className="max-w-xl">
          <TaskForm
            members={members}
            onSubmit={handleCreateTask}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="bg-slate-50 border border-border p-4 rounded-2xl flex flex-col space-y-4 min-h-[350px]">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">{col.name}</h4>
                <span className="text-[10px] bg-slate-200 text-textSecondary font-bold px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-8 text-[10px] text-textSecondary italic border border-dashed border-border rounded-xl">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
