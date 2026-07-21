import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const CollaborationRequestModal = ({ developer, onClose }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [proposedRole, setProposedRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const res = await API.get('/projects');
        const token = localStorage.getItem('token');
        if (token) {
          const profileRes = await API.get('/auth/profile');
          const myId = profileRes.data._id;
          const owned = res.data.filter(p => p.ownerId._id === myId || p.ownerId === myId);
          setProjects(owned);
          if (owned.length > 0) setSelectedProjectId(owned[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return toast.error('Please enter a message');

    setSubmitting(true);
    try {
      await API.post('/collaboration/request', {
        receiverId: developer._id,
        projectId: selectedProjectId || null,
        message,
        proposedRole
      });
      toast.success(`Collaboration invitation sent to ${developer.name}!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-border shadow-2xl p-8 relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-textSecondary hover:text-textPrimary font-bold text-xl">&times;</button>

        <h3 className="text-lg font-bold text-textPrimary mb-2">Invite Developer</h3>
        <p className="text-xs text-textSecondary mb-6">Invite {developer.name} (@{developer.username}) to collaborate on your projects.</p>

        {loading ? (
          <div className="text-center text-xs text-textSecondary py-6">Loading your projects...</div>
        ) : projects.length === 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-textSecondary italic">You don't own any active projects to invite developers to. Create a project first!</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-border rounded-xl text-xs font-bold text-textSecondary"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Select Project *</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                required
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Proposed Role</label>
              <input
                type="text"
                value={proposedRole}
                onChange={(e) => setProposedRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                placeholder="e.g. Backend Developer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-none"
                placeholder="Hi, I saw your skills in React and would love to have you on my project..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {submitting ? 'Sending invitation...' : 'Send Invitation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CollaborationRequestModal;
