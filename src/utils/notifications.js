import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(uid) {
  if (!Device.isDevice) {
    console.log('Push notif hanya jalan di device fisik');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Izin notifikasi ditolak');
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'YOUR_EXPO_PROJECT_ID',
  });

  await updateDoc(doc(db, 'users', uid), {
    pushToken: token.data,
  });

  return token.data;
}

export async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}