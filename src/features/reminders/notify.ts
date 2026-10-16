import { useAppStore, type ReminderKind } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { usePrefsStore } from '@/store/usePrefsStore';
import { strings } from '@/lib/strings.fr';
import { notificationFor } from './logic';

export type BrowserNotifState = 'granted' | 'denied' | 'default' | 'unsupported';

export function browserNotificationState(): BrowserNotifState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotifications(): Promise<BrowserNotifState> {
  if (browserNotificationState() === 'unsupported') return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Envoie une vraie notification navigateur si elle est autorisée (bonus).
 * En mode discret, elle s'affiche sur l'écran de verrouillage : aucun mot sensible.
 */
async function sendBrowserNotification(title: string, body: string) {
  if (browserNotificationState() !== 'granted') return;
  if (usePrefsStore.getState().discreet) {
    title = strings.privacy.neutralNotifTitle;
    body = strings.privacy.neutralNotifBody;
  }
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' });
    else new Notification(title, { body, icon: '/icons/icon-192.png' });
  } catch {
    /* notifications non disponibles : la notification simulée suffit */
  }
}

/** Notification simulée (toast + centre de notifications) et, si possible, notification réelle. */
export function notifyReminder(kind: ReminderKind | 'followup', key?: string) {
  const { title, body } = notificationFor(kind);
  const before = useAppStore.getState().notifications.length;
  useAppStore.getState().pushNotification({ title, body, kind }, key);
  if (useAppStore.getState().notifications.length === before) return; // déjà notifié
  useUiStore.getState().toast(title, 'info');
  void sendBrowserNotification(title, body);
}
