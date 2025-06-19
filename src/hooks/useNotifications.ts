import { useRef } from 'react';
import { SplashedPushNotificationsHandle, NotificationType } from '@/components/ui/splashed-push-notifications';

export function useNotifications() {
  const notificationRef = useRef<SplashedPushNotificationsHandle>(null);

  const showNotification = (type: NotificationType, title: string, message: string) => {
    notificationRef.current?.createNotification(type, title, message);
  };

  const showSuccess = (title: string, message: string) => {
    showNotification('success', title, message);
  };

  const showError = (title: string, message: string) => {
    showNotification('error', title, message);
  };

  const showWarning = (title: string, message: string) => {
    showNotification('warning', title, message);
  };

  const showInfo = (title: string, message: string) => {
    showNotification('help', title, message);
  };

  return {
    notificationRef,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}