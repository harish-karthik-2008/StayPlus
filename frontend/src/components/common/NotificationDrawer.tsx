import React from 'react';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-coral-200 shadow-2xl flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="p-5 border-b border-coral-100 flex items-center justify-between bg-coral-50/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-coral-100 rounded-lg text-coral-700">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#252525]">Notifications</h3>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  title="Mark all as read"
                  className="p-1.5 text-gray-400 hover:text-coral-600 rounded-lg hover:bg-coral-100/50 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  title="Clear notifications"
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-coral-50 text-coral-400 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-600">No new notifications</p>
                <p className="text-xs text-gray-400 mt-1">
                  You will receive real-time updates when high churn risks or dataset changes occur.
                </p>
              </div>
            ) : (
              notifications.map(notif => {
                const icon = {
                  danger: <AlertCircle className="w-4 h-4 text-red-600" />,
                  warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
                  success: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                  info: <Info className="w-4 h-4 text-sky-600" />,
                }[notif.type];

                const borderAccent = {
                  danger: 'border-l-red-500',
                  warning: 'border-l-amber-500',
                  success: 'border-l-emerald-500',
                  info: 'border-l-sky-500',
                }[notif.type];

                return (
                  <div
                    key={notif.id}
                    onClick={() => onNotificationClick(notif)}
                    className={`p-3.5 rounded-xl border border-coral-100 border-l-4 ${borderAccent} transition-all cursor-pointer hover:shadow-md ${
                      notif.read ? 'bg-white opacity-80' : 'bg-coral-50/40 font-medium'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#252525] truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0">{notif.timeAgo}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-coral-100 text-center">
            <p className="text-[11px] text-gray-400">
              ChurnGuard AI Intelligence Engine • Live Activity Feed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
