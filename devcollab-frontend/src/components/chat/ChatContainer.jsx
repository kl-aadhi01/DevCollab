import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useSocket } from '../../context/SocketContext';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const ChatContainer = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await API.get(`/messages/project/${projectId}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_project', projectId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.emit('leave_project', projectId);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, projectId]);

  const handleSendMessage = async (content) => {
    try {
      await API.post('/messages', { projectId, content });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-xs text-textSecondary">Loading project chat...</div>;
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 px-6 py-4 border-b border-border">
        <h3 className="text-sm font-bold text-textPrimary">Project Team Chat</h3>
        <p className="text-[10px] text-textSecondary">Real-time discussion board</p>
      </div>

      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
