import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, 
    Paper, 
    Typography,
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { addNotification, removeNotification } from '../store/uiSlice';

const NotificationCenter = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(state => state.ui.components.notifications);

    // Simulate real-time notifications
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(addNotification({
                id: Date.now(),
                message: `Notification ${Date.now()}`,
                timestamp: new Date().toISOString()
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, [dispatch]);

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
                        onClick={() => dispatch(removeNotification(notification.id))}
                    >
                        <CloseIcon />
                    </IconButton>
                </Paper>
            ))}
        </Box>
    );
};

export default NotificationCenter;
