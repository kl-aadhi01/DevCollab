import React from 'react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, dismissNotification } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center bg-white border border-border px-6 py-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Your Notifications</h2>
          <p className="text-xs text-textSecondary mt-0.5">Stay updated on task assignments and team requests.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-primary hover:underline bg-slate-50 border border-border px-3 py-1.5 rounded-lg"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm divide-y divide-border">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-xs text-textSecondary italic">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.read) markAsRead(n._id);
              }}
              className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-indigo-50/20' : ''}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <span className={`text-xs font-bold ${!n.read ? 'text-primary' : 'text-textSecondary'}`}>
                    {n.type?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-textPrimary leading-relaxed font-semibold">
                  {n.message}
                </p>
                <span className="block text-[10px] text-textSecondary font-semibold">
                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(n._id);
                }}
                className="text-[10px] text-error hover:underline focus:outline-none"
              >
                Dismiss
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
