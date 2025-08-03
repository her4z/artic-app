import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification configuration constants
const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'default',
  PERMISSION_KEY: '@hasAskedNotificationsPermission',
  DEFAULT_SOUND: 'default',
  VIBRATION_PATTERN: [0, 250, 250, 250] as number[],
  LIGHT_COLOR: '#FF231F7C',
} as const;

// Notification types
export type NotificationType =
  | 'artwork_discovery'
  | 'bookmark_reminder'
  | 'daily_inspiration'
  | 'general';

// Notification content interface
export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
  type?: NotificationType;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure notifications and request permissions
 */
export const configureNotifications = async (): Promise<boolean> => {
  try {
    // Check if we've already asked for permission
    const alreadyAskedForPermission = await AsyncStorage.getItem(
      NOTIFICATION_CONFIG.PERMISSION_KEY,
    );

    if (alreadyAskedForPermission === 'true') {
      return await checkNotificationPermission();
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CONFIG.CHANNEL_ID, {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: NOTIFICATION_CONFIG.VIBRATION_PATTERN,
        lightColor: NOTIFICATION_CONFIG.LIGHT_COLOR,
        sound: NOTIFICATION_CONFIG.DEFAULT_SOUND,
      });
    }

    // Request permissions
    const permissionGranted = await requestNotificationPermission();

    // Mark that we've asked for permission
    await AsyncStorage.setItem(NOTIFICATION_CONFIG.PERMISSION_KEY, 'true');

    return permissionGranted;
  } catch (error) {
    console.error('[Notifications] Configuration failed:', error);
    return false;
  }
};

/**
 * Check current notification permission status
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Notifications] Permission check failed:', error);
    return false;
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (status !== 'granted') {
      const { status: requestStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = requestStatus;
    }

    if (finalStatus !== 'granted') {
      showPermissionAlert();
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return false;
  }
};

/**
 * Show alert when permission is denied
 */
const showPermissionAlert = () => {
  Alert.alert(
    'Permission Denied',
    'Enable notifications to receive alerts about new artworks and features.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Go to Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ],
  );
};

/**
 * Send a notification
 */
export const sendNotification = async (
  content: NotificationContent,
  delaySeconds: number = 1,
): Promise<string | null> => {
  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.warn('[Notifications] Permission not granted');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data || {},
        sound: NOTIFICATION_CONFIG.DEFAULT_SOUND,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        repeats: false,
      },
    });

    console.log(`[Notifications] Sent notification: ${content.title}`);
    return notificationId;
  } catch (error) {
    console.error('[Notifications] Failed to send notification:', error);
    return null;
  }
};

/**
 * Schedule daily notification at 12 PM with today's artwork recommendation
 */
export const scheduleDailyNotification = async (): Promise<void> => {
  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.warn('[Notifications] Permission not granted for daily notifications');
      return;
    }

    if (await isDailyNotificationScheduled()) {
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Art Inspiration 🎨',
        body: "Discover today's artwork recommendation",
        data: { type: 'daily_reminder' },
        sound: NOTIFICATION_CONFIG.DEFAULT_SOUND,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 12, // 12 PM
        minute: 0,
      },
      identifier: 'daily-reminder',
    });

    console.log('[Notifications] Scheduled daily notification:', notificationId);
  } catch (error) {
    console.error('[Notifications] Failed to schedule daily notification:', error);
  }
};

/**
 * Check if daily notification is scheduled
 */
export const isDailyNotificationScheduled = async (): Promise<boolean> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.some(
      (notification) => notification.identifier === 'daily-reminder',
    );
  } catch (error) {
    console.error('[Notifications] Failed to check scheduled notifications:', error);
    return false;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  } catch (error) {
    console.error('[Notifications] Failed to cancel notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Failed to get scheduled notifications:', error);
    return [];
  }
};
