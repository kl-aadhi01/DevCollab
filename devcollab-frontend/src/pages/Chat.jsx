import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatContainer from '../components/chat/ChatContainer';
import API from '../services/api';

const Chat = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const res = await API.get('/projects');
        if (user) {
          const myId = user._id || user.id;
          const myProjects = res.data.filter(p =>
            p.ownerId?._id === myId ||
            p.ownerId === myId ||
            (p.members && p.members.some(m => m._id === myId || m === myId))
          );
          setProjects(myProjects);
          if (myProjects.length > 0) setActiveProjectId(myProjects[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyProjects();
  }, [user]);

  if (loading) return <div className="text-center py-12 text-xs text-textSecondary">Loading chat boards...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white border border-border px-6 py-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Project Group Chat</h2>
          <p className="text-xs text-textSecondary mt-0.5">Chat in real-time with your team members.</p>
        </div>

        {projects.length > 0 && (
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="px-4 py-2 border border-border rounded-xl text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-border">
          <span className="text-4xl">💬</span>
          <h3 className="text-sm font-bold text-textPrimary mt-4">No project chats</h3>
          <p className="text-xs text-textSecondary mt-2">You must join a project to participate in group discussions.</p>
        </div>
      ) : (
        activeProjectId && <ChatContainer projectId={activeProjectId} />
      )}
    </div>
  );
};

export default Chat;
