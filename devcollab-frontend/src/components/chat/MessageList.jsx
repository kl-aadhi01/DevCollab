import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const MessageList = ({ messages }) => {
  const { user } = useAuth();
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[400px]" ref={listRef}>
      {messages.length === 0 ? (
        <div className="text-center text-xs text-textSecondary italic py-8">No messages yet. Say hello!</div>
      ) : (
        messages.map((m) => {
          const isMe = m.senderId?._id === user._id || m.senderId === user._id || m.senderId?.id === user._id || (m.senderId?._id && m.senderId?._id === user.id);
          return (
            <div key={m._id || m.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              {!isMe && (
                <Avatar user={m.senderId} size="sm" />
              )}

              <div className="space-y-1">
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-textPrimary rounded-tl-none'}`}>
                  {!isMe && <span className="block font-bold text-[10px] text-textSecondary mb-1">@{m.senderId?.username}</span>}
                  {m.content}
                </div>
                <span className={`block text-[9px] text-textSecondary ${isMe ? 'text-right' : ''}`}>
                  {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;
