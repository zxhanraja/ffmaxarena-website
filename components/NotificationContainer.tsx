import React from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
    const { notifications } = useNotificationContext();

    return (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-xs space-y-3">
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    notification={notification}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;
