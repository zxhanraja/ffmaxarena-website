import React, { useState, useEffect } from 'react';
import { useNotificationContext, Notification as NotificationType } from '../contexts/NotificationContext';
import { CheckCircleIcon, AlertTriangleIcon, XIcon } from './icons/IconDefs';

interface NotificationProps {
    notification: NotificationType;
}

const typeStyles = {
    success: {
        bg: 'bg-green-600/80',
        border: 'border-green-400/50',
        icon: <CheckCircleIcon className="h-6 w-6 text-white" />,
    },
    error: {
        bg: 'bg-red-600/80',
        border: 'border-red-400/50',
        icon: <AlertTriangleIcon className="h-6 w-6 text-white" />,
    },
    info: {
        bg: 'bg-blue-600/80',
        border: 'border-blue-400/50',
        icon: <CheckCircleIcon className="h-6 w-6 text-white" />,
    },
};

const Notification: React.FC<NotificationProps> = ({ notification }) => {
    const { removeNotification } = useNotificationContext();
    const [isExiting, setIsExiting] = useState(false);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => {
            removeNotification(notification.id);
        }, 300); // Match animation duration
    };
    
    useEffect(() => {
        const timer = setTimeout(() => {
            handleRemove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notification.id]);

    const styles = typeStyles[notification.type];
    
    return (
        <div
            className={`
                relative flex items-start p-4 w-full rounded-lg shadow-2xl text-white
                border ${styles.border} ${styles.bg} backdrop-blur-md
                transition-all duration-300
                ${isExiting ? 'animate-[toast-out_0.3s_ease-out_forwards]' : 'animate-[toast-in_0.3s_ease-out_forwards]'}
            `}
            role="alert"
        >
            <div className="flex-shrink-0">{styles.icon}</div>
            <div className="ml-3 flex-1 pt-0.5">
                <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button
                    onClick={handleRemove}
                    className="inline-flex rounded-md text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white"
                >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default Notification;
