import { useEffect } from 'react';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    const initializePushNotifications = async () => {
      try {
        // Request permission to use push notifications
        const permissionResult = await PushNotifications.requestPermissions();
        
        if (permissionResult.receive === 'granted') {
          // Register for push notifications
          await PushNotifications.register();
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    const addListeners = async () => {
      // On successful registration
      await PushNotifications.addListener('registration', async (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        
        // Save token to database
        try {
          const platform = Capacitor.getPlatform();
          await supabase
            .from('push_tokens')
            .upsert({
              user_id: user.id,
              token: token.value,
              platform: platform === 'ios' ? 'ios' : 'android'
            });
        } catch (error) {
          console.error('Error saving push token:', error);
        }
      });

      // Registration error
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Registration error: ', error.error);
      });

      // Handle notification received while app is in foreground
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        
        // Show in-app notification
        toast({
          title: notification.title || 'New notification',
          description: notification.body,
        });
      });

      // Handle notification tap
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification);
        
        // Handle navigation based on notification data
        const data = notification.notification.data;
        if (data?.type === 'order_status' && data?.order_id) {
          // Navigate to order details or dashboard
          // This would depend on your routing setup
          window.location.href = '/dashboard';
        }
      });
    };

    initializePushNotifications();
    addListeners();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user, toast]);

  return {
    // You can add methods here to send notifications, etc.
  };
};