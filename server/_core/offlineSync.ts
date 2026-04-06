import { db } from "../db";
import { syncQueue, emergencyAlerts, conferenceRooms, mediaPlaylists } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  entity: "emergency" | "conference" | "media";
  entityId: number;
  data: Record<string, any>;
  timestamp: number;
  status: "pending" | "synced" | "failed";
  userId: number;
}

export interface SyncConflict {
  id: string;
  operation: SyncOperation;
  remoteVersion: Record<string, any>;
  resolution: "local" | "remote" | "merged";
  timestamp: number;
}

/**
 * Add operation to sync queue for offline-first architecture
 */
export async function queueOperation(
  userId: number,
  type: "create" | "update" | "delete",
  entity: "emergency" | "conference" | "media",
  entityId: number,
  data: Record<string, any>
): Promise<SyncOperation> {
  const operation: SyncOperation = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    entity,
    entityId,
    data,
    timestamp: Date.now(),
    status: "pending",
    userId,
  };

  await db.insert(syncQueue).values({
    userId,
    operationType: type,
    entityType: entity,
    entityId,
    operationData: JSON.stringify(data),
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return operation;
}

/**
 * Get pending sync operations for a user
 */
export async function getPendingOperations(userId: number): Promise<SyncOperation[]> {
  const operations = await db
    .select()
    .from(syncQueue)
    .where(and(eq(syncQueue.userId, userId), eq(syncQueue.status, "pending")));

  return operations.map((op) => ({
    id: op.id || "",
    type: op.operationType as "create" | "update" | "delete",
    entity: op.entityType as "emergency" | "conference" | "media",
    entityId: op.entityId,
    data: JSON.parse(op.operationData || "{}"),
    timestamp: op.createdAt?.getTime() || 0,
    status: op.status as "pending" | "synced" | "failed",
    userId: op.userId,
  }));
}

/**
 * Mark operation as synced
 */
export async function markAsSynced(operationId: string): Promise<void> {
  await db
    .update(syncQueue)
    .set({ status: "synced", updatedAt: new Date() })
    .where(eq(syncQueue.id, parseInt(operationId)));
}

/**
 * Mark operation as failed
 */
export async function markAsFailed(operationId: string, error: string): Promise<void> {
  await db
    .update(syncQueue)
    .set({
      status: "failed",
      updatedAt: new Date(),
      errorMessage: error,
    })
    .where(eq(syncQueue.id, parseInt(operationId)));
}

/**
 * Resolve sync conflict using merge strategy
 */
export async function resolveConflict(
  operation: SyncOperation,
  remoteVersion: Record<string, any>,
  strategy: "local" | "remote" | "merged"
): Promise<Record<string, any>> {
  if (strategy === "local") {
    return operation.data;
  }

  if (strategy === "remote") {
    return remoteVersion;
  }

  // Merge strategy: combine both versions, preferring remote for timestamps
  const merged = {
    ...operation.data,
    ...remoteVersion,
    lastMerged: new Date().toISOString(),
    mergedFrom: {
      local: operation.data,
      remote: remoteVersion,
    },
  };

  return merged;
}

/**
 * Sync all pending operations
 */
export async function syncAllPending(userId: number): Promise<{
  synced: number;
  failed: number;
  conflicts: SyncConflict[];
}> {
  const operations = await getPendingOperations(userId);
  let synced = 0;
  let failed = 0;
  const conflicts: SyncConflict[] = [];

  for (const operation of operations) {
    try {
      // Apply operation based on type
      switch (operation.type) {
        case "create":
          await applyCreateOperation(operation);
          synced++;
          await markAsSynced(operation.id);
          break;

        case "update":
          await applyUpdateOperation(operation);
          synced++;
          await markAsSynced(operation.id);
          break;

        case "delete":
          await applyDeleteOperation(operation);
          synced++;
          await markAsSynced(operation.id);
          break;
      }
    } catch (error) {
      failed++;
      await markAsFailed(operation.id, String(error));
    }
  }

  return { synced, failed, conflicts };
}

/**
 * Apply create operation
 */
async function applyCreateOperation(operation: SyncOperation): Promise<void> {
  switch (operation.entity) {
    case "emergency":
      await db.insert(emergencyAlerts).values({
        userId: operation.userId,
        type: operation.data.type,
        location: operation.data.location,
        description: operation.data.description,
        severity: operation.data.severity,
        status: "active",
        createdAt: new Date(operation.timestamp),
        updatedAt: new Date(),
      });
      break;

    case "conference":
      await db.insert(conferenceRooms).values({
        userId: operation.userId,
        name: operation.data.name,
        description: operation.data.description,
        capacity: operation.data.capacity,
        status: "available",
        createdAt: new Date(operation.timestamp),
        updatedAt: new Date(),
      });
      break;

    case "media":
      await db.insert(mediaPlaylists).values({
        userId: operation.userId,
        name: operation.data.name,
        description: operation.data.description,
        isPublic: operation.data.isPublic || false,
        trackCount: 0,
        createdAt: new Date(operation.timestamp),
        updatedAt: new Date(),
      });
      break;
  }
}

/**
 * Apply update operation
 */
async function applyUpdateOperation(operation: SyncOperation): Promise<void> {
  switch (operation.entity) {
    case "emergency":
      await db
        .update(emergencyAlerts)
        .set({
          ...operation.data,
          updatedAt: new Date(),
        })
        .where(eq(emergencyAlerts.id, operation.entityId));
      break;

    case "conference":
      await db
        .update(conferenceRooms)
        .set({
          ...operation.data,
          updatedAt: new Date(),
        })
        .where(eq(conferenceRooms.id, operation.entityId));
      break;

    case "media":
      await db
        .update(mediaPlaylists)
        .set({
          ...operation.data,
          updatedAt: new Date(),
        })
        .where(eq(mediaPlaylists.id, operation.entityId));
      break;
  }
}

/**
 * Apply delete operation
 */
async function applyDeleteOperation(operation: SyncOperation): Promise<void> {
  switch (operation.entity) {
    case "emergency":
      await db.delete(emergencyAlerts).where(eq(emergencyAlerts.id, operation.entityId));
      break;

    case "conference":
      await db.delete(conferenceRooms).where(eq(conferenceRooms.id, operation.entityId));
      break;

    case "media":
      await db.delete(mediaPlaylists).where(eq(mediaPlaylists.id, operation.entityId));
      break;
  }
}

/**
 * Get sync status for user
 */
export async function getSyncStatus(userId: number): Promise<{
  pendingCount: number;
  failedCount: number;
  lastSync: Date | null;
  isOnline: boolean;
}> {
  const pending = await db
    .select()
    .from(syncQueue)
    .where(and(eq(syncQueue.userId, userId), eq(syncQueue.status, "pending")));

  const failed = await db
    .select()
    .from(syncQueue)
    .where(and(eq(syncQueue.userId, userId), eq(syncQueue.status, "failed")));

  const lastSynced = await db
    .select()
    .from(syncQueue)
    .where(and(eq(syncQueue.userId, userId), eq(syncQueue.status, "synced")))
    .orderBy((t) => t.updatedAt)
    .limit(1);

  return {
    pendingCount: pending.length,
    failedCount: failed.length,
    lastSync: lastSynced[0]?.updatedAt || null,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  };
}
