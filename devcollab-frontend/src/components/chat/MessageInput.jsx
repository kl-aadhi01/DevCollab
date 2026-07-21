import React, { useState } from 'react';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-border bg-white">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
        placeholder="Type a message..."
        required
      />
      <button
        type="submit"
        className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm transition-all"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
