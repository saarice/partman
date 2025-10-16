import { useEffect, useState } from 'react';
import { Box, Alert, AlertTitle, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { subscribeToNotifications, notify, type Notification } from '../../utils/notifications';

export function NotificationContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setNotifications);
    return unsubscribe;
  }, []);

  const getAlertSeverity = (type: string) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'loading':
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
        width: '100%',
      }}
    >
      {notifications.map((notification, index) => (
        <Slide
          key={notification.id}
          direction="left"
          in={true}
          mountOnEnter
          unmountOnExit
        >
          <Alert
            severity={getAlertSeverity(notification.type)}
            sx={{
              mb: 1,
              boxShadow: 3,
            }}
            action={
              <IconButton
                size="small"
                onClick={() => notify.dismiss(notification.id)}
                sx={{ color: 'inherit' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Slide>
      ))}
    </Box>
  );
}
