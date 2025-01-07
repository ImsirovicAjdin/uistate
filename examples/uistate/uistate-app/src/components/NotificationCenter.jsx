import React, { useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography,
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useUIState } from '../core/useUIState';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useUIState('notifications', []);

    // Simulate real-time notifications
    useEffect(() => {
        const interval = setInterval(() => {
            const newNotification = {
                id: Date.now(),
                message: `Notification ${Date.now()}`,
                timestamp: new Date().toISOString()
            };
            setNotifications([...notifications, newNotification]);
        }, 2000);

        return () => clearInterval(interval);
    }, [notifications, setNotifications]);

    const removeNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 70,
                right: 16,
                width: 300,
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 1000,
            }}
        >
            {notifications.map(notification => (
                <Paper
                    key={notification.id}
                    sx={{
                        p: 2,
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        animation: 'slideIn 0.3s ease-out',
                        '@keyframes slideIn': {
                            from: {
                                transform: 'translateX(100%)',
                                opacity: 0
                            },
                            to: {
                                transform: 'translateX(0)',
                                opacity: 1
                            }
                        }
                    }}
                >
                    <Box>
                        <Typography variant="body1">
                            {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => removeNotification(notification.id)}
                    >
                        <CloseIcon />
                    </IconButton>
                </Paper>
            ))}
        </Box>
    );
};

export default NotificationCenter;
