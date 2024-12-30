import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';

export function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  const notifications = useLiveQuery(
    () => user ? db.notifications
      .where('userId').equals(user.id!)
      .reverse()
      .limit(5)
      .toArray() : []
  );

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  const handleMarkAsRead = async (notificationId: number) => {
    await db.notifications.update(notificationId, { read: true });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              {notifications?.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications</p>
              ) : (
                notifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                    onClick={() => handleMarkAsRead(notification.id!)}
                  >
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}