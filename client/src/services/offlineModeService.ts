// Offline Mode Service - IndexedDB-based local storage for offline access
// Enables core functions without internet connection

export interface CachedDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  cachedAt: Date;
  expiresAt: Date;
  size: number;
}

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingActions: number;
  cachedDocuments: number;
  storageUsed: number;
  storageLimit: number;
}

export interface ConflictResolution {
  id: string;
  entity: string;
  localData: any;
  serverData: any;
  conflictType: 'update' | 'delete';
  detectedAt: Date;
  resolved: boolean;
  resolution?: 'local' | 'server' | 'merge';
}

class OfflineModeService {
  private dbName = 'laws-collective-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private pendingActions: PendingAction[] = [];
  private cachedDocs: CachedDocument[] = [];
  private conflicts: ConflictResolution[] = [];
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.initOnlineListener();
    this.initDB();
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadCachedData();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }

        // Pending actions store
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // User data store
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' });
        }
      };
    });
  }

  // Listen for online/offline events
  private initOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  // Load cached data from IndexedDB
  private async loadCachedData() {
    if (!this.db) return;

    // Load cached documents
    const docTransaction = this.db.transaction('documents', 'readonly');
    const docStore = docTransaction.objectStore('documents');
    const docRequest = docStore.getAll();

    docRequest.onsuccess = () => {
      this.cachedDocs = docRequest.result || [];
    };

    // Load pending actions
    const actionTransaction = this.db.transaction('pendingActions', 'readonly');
    const actionStore = actionTransaction.objectStore('pendingActions');
    const actionRequest = actionStore.getAll();

    actionRequest.onsuccess = () => {
      this.pendingActions = actionRequest.result || [];
    };
  }

  // Cache a document for offline access
  async cacheDocument(doc: Omit<CachedDocument, 'cachedAt' | 'expiresAt'>): Promise<void> {
    if (!this.db) await this.initDB();

    const cachedDoc: CachedDocument = {
      ...doc,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('documents', 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.put(cachedDoc);

      request.onsuccess = () => {
        this.cachedDocs = this.cachedDocs.filter(d => d.id !== doc.id);
        this.cachedDocs.push(cachedDoc);
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get cached document
  async getCachedDocument(id: string): Promise<CachedDocument | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('documents', 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all cached documents
  getCachedDocuments(): CachedDocument[] {
    return this.cachedDocs;
  }

  // Remove cached document
  async removeCachedDocument(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('documents', 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.delete(id);

      request.onsuccess = () => {
        this.cachedDocs = this.cachedDocs.filter(d => d.id !== id);
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Queue an action for later sync
  async queueAction(action: Omit<PendingAction, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.initDB();

    const pendingAction: PendingAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('pendingActions', 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.add(pendingAction);

      request.onsuccess = () => {
        this.pendingActions.push(pendingAction);
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get pending actions
  getPendingActions(): PendingAction[] {
    return this.pendingActions;
  }

  // Sync pending actions when online
  async syncPendingActions(): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline || this.pendingActions.length === 0) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;

    for (const action of [...this.pendingActions]) {
      try {
        // Simulate API call
        await this.simulateDelay(500);
        
        // Remove from pending
        await this.removePendingAction(action.id);
        synced++;
      } catch (error) {
        action.retryCount++;
        action.lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (action.retryCount >= 3) {
          // Move to failed state or create conflict
          this.conflicts.push({
            id: `conflict-${Date.now()}`,
            entity: action.entity,
            localData: action.data,
            serverData: null,
            conflictType: action.type === 'delete' ? 'delete' : 'update',
            detectedAt: new Date(),
            resolved: false,
          });
        }
        failed++;
      }
    }

    this.notifyListeners();
    return { synced, failed };
  }

  // Remove pending action
  private async removePendingAction(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('pendingActions', 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.delete(id);

      request.onsuccess = () => {
        this.pendingActions = this.pendingActions.filter(a => a.id !== id);
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get conflicts
  getConflicts(): ConflictResolution[] {
    return this.conflicts.filter(c => !c.resolved);
  }

  // Resolve conflict
  resolveConflict(conflictId: string, resolution: 'local' | 'server' | 'merge'): void {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (conflict) {
      conflict.resolved = true;
      conflict.resolution = resolution;
      this.notifyListeners();
    }
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    const storageUsed = this.cachedDocs.reduce((sum, d) => sum + d.size, 0);

    return {
      isOnline: this.isOnline,
      lastSync: this.pendingActions.length === 0 ? new Date() : null,
      pendingActions: this.pendingActions.length,
      cachedDocuments: this.cachedDocs.length,
      storageUsed,
      storageLimit: 50 * 1024 * 1024, // 50MB limit
    };
  }

  // Subscribe to status changes
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== callback);
    };
  }

  // Notify listeners
  private notifyListeners() {
    const status = this.getSyncStatus();
    this.syncListeners.forEach(l => l(status));
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    const stores = ['documents', 'pendingActions', 'settings', 'userData'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    this.cachedDocs = [];
    this.pendingActions = [];
    this.conflicts = [];
    this.notifyListeners();
  }

  // Check if feature is available offline
  isFeatureAvailableOffline(feature: string): boolean {
    const offlineFeatures = [
      'document-view',
      'document-edit',
      'workflow-view',
      'settings-view',
      'profile-view',
    ];
    return offlineFeatures.includes(feature);
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const offlineModeService = new OfflineModeService();
