/**
 * Service Worker Manager
 * Handles service worker registration, push subscriptions, and offline support
 */

export interface ServiceWorkerConfig {
  swPath?: string;
  vapidPublicKey: string;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig | null = null;
  private subscription: PushSubscription | null = null;

  /**
   * Initialize service worker
   */
  async initialize(config: ServiceWorkerConfig): Promise<boolean> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Workers not supported");
      return false;
    }

    if (!("PushManager" in window)) {
      console.warn("Push Notifications not supported");
      return false;
    }

    this.config = config;

    try {
      const swPath = config.swPath || "/sw.js";
      this.registration = await navigator.serviceWorker.register(swPath, {
        scope: "/",
      });

      console.log("Service Worker registered:", this.registration);

      // Check for existing subscription
      const existingSubscription =
        await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
      }

      return true;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration || !this.config) {
      console.error("Service Worker not initialized");
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          this.config.vapidPublicKey
        ),
      });

      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error("Push subscription failed:", error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      const success = await this.subscription.unsubscribe();
      if (success) {
        this.subscription = null;
      }
      return success;
    } catch (error) {
      console.error("Push unsubscription failed:", error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Check if subscribed
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return "denied";
  }

  /**
   * Send local notification
   */
  showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!this.registration) {
      console.error("Service Worker not initialized");
      return Promise.reject("Service Worker not initialized");
    }

    return this.registration.showNotification(title, {
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      ...options,
    });
  }

  /**
   * Listen for messages from service worker
   */
  onMessage(callback: (data: any) => void): void {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.addEventListener("message", (event) => {
      callback(event.data);
    });
  }

  /**
   * Send message to service worker
   */
  postMessage(data: any): void {
    if (!this.registration?.active) {
      console.warn("Service Worker not active");
      return;
    }

    this.registration.active.postMessage(data);
  }

  /**
   * Check offline status
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Listen for online/offline events
   */
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const success = await this.registration.unregister();
      if (success) {
        this.registration = null;
        this.subscription = null;
      }
      return success;
    } catch (error) {
      console.error("Service Worker unregistration failed:", error);
      return false;
    }
  }

  /**
   * Convert VAPID public key from base64
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Get service worker status
   */
  async getStatus(): Promise<{
    registered: boolean;
    active: boolean;
    subscribed: boolean;
    online: boolean;
    notificationPermission: NotificationPermission;
  }> {
    return {
      registered: this.registration !== null,
      active: this.registration?.active !== undefined,
      subscribed: this.subscription !== null,
      online: this.isOnline(),
      notificationPermission: Notification.permission,
    };
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();
