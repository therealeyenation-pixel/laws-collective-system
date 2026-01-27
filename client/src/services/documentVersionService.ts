// Document Version Control Service
// Handles version history, diff comparison, and rollback

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  content: string;
  contentHash: string;
  size: number;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  comment?: string;
  tags?: string[];
  changes: VersionChange[];
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  field?: string;
  oldValue?: string;
  newValue?: string;
  lineNumber?: number;
}

export interface VersionDiff {
  versionA: number;
  versionB: number;
  additions: number;
  deletions: number;
  modifications: number;
  changes: DiffLine[];
}

export interface DiffLine {
  lineNumber: number;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  oldContent?: string;
  newContent?: string;
}

export interface VersionHistory {
  documentId: string;
  documentName: string;
  totalVersions: number;
  currentVersion: number;
  versions: DocumentVersion[];
}

export interface RollbackResult {
  success: boolean;
  message: string;
  newVersion?: DocumentVersion;
}

class DocumentVersionService {
  private readonly STORAGE_KEY = 'document_versions';

  // Create a new version of a document
  createVersion(
    documentId: string,
    content: string,
    userId: string,
    userName: string,
    comment?: string
  ): DocumentVersion {
    const history = this.getVersionHistory(documentId);
    const previousVersion = history.versions[history.versions.length - 1];
    
    const changes = previousVersion 
      ? this.calculateChanges(previousVersion.content, content)
      : [{ type: 'added' as const, newValue: 'Initial version' }];

    const newVersion: DocumentVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      versionNumber: history.totalVersions + 1,
      content,
      contentHash: this.hashContent(content),
      size: new Blob([content]).size,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date(),
      comment,
      changes
    };

    history.versions.push(newVersion);
    history.totalVersions++;
    history.currentVersion = newVersion.versionNumber;
    
    this.saveVersionHistory(documentId, history);
    return newVersion;
  }

  // Get version history for a document
  getVersionHistory(documentId: string): VersionHistory {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${documentId}`);
    if (stored) {
      const history = JSON.parse(stored);
      history.versions = history.versions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }));
      return history;
    }

    return {
      documentId,
      documentName: `Document ${documentId}`,
      totalVersions: 0,
      currentVersion: 0,
      versions: []
    };
  }

  // Get a specific version
  getVersion(documentId: string, versionNumber: number): DocumentVersion | null {
    const history = this.getVersionHistory(documentId);
    return history.versions.find(v => v.versionNumber === versionNumber) || null;
  }

  // Compare two versions
  compareVersions(documentId: string, versionA: number, versionB: number): VersionDiff | null {
    const verA = this.getVersion(documentId, versionA);
    const verB = this.getVersion(documentId, versionB);

    if (!verA || !verB) return null;

    const linesA = verA.content.split('\n');
    const linesB = verB.content.split('\n');
    const changes: DiffLine[] = [];
    let additions = 0;
    let deletions = 0;
    let modifications = 0;

    const maxLines = Math.max(linesA.length, linesB.length);
    
    for (let i = 0; i < maxLines; i++) {
      const lineA = linesA[i];
      const lineB = linesB[i];

      if (lineA === undefined && lineB !== undefined) {
        changes.push({
          lineNumber: i + 1,
          type: 'added',
          newContent: lineB
        });
        additions++;
      } else if (lineA !== undefined && lineB === undefined) {
        changes.push({
          lineNumber: i + 1,
          type: 'removed',
          oldContent: lineA
        });
        deletions++;
      } else if (lineA !== lineB) {
        changes.push({
          lineNumber: i + 1,
          type: 'modified',
          oldContent: lineA,
          newContent: lineB
        });
        modifications++;
      } else {
        changes.push({
          lineNumber: i + 1,
          type: 'unchanged',
          oldContent: lineA,
          newContent: lineB
        });
      }
    }

    return {
      versionA,
      versionB,
      additions,
      deletions,
      modifications,
      changes
    };
  }

  // Rollback to a previous version
  rollback(
    documentId: string,
    targetVersion: number,
    userId: string,
    userName: string,
    reason?: string
  ): RollbackResult {
    const targetVer = this.getVersion(documentId, targetVersion);
    
    if (!targetVer) {
      return {
        success: false,
        message: `Version ${targetVersion} not found`
      };
    }

    const newVersion = this.createVersion(
      documentId,
      targetVer.content,
      userId,
      userName,
      reason || `Rolled back to version ${targetVersion}`
    );

    return {
      success: true,
      message: `Successfully rolled back to version ${targetVersion}`,
      newVersion
    };
  }

  // Get version timeline for visualization
  getVersionTimeline(documentId: string): { date: string; versions: DocumentVersion[] }[] {
    const history = this.getVersionHistory(documentId);
    const grouped: Map<string, DocumentVersion[]> = new Map();

    for (const version of history.versions) {
      const dateKey = version.createdAt.toISOString().split('T')[0];
      const existing = grouped.get(dateKey) || [];
      existing.push(version);
      grouped.set(dateKey, existing);
    }

    return Array.from(grouped.entries())
      .map(([date, versions]) => ({ date, versions }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  // Add annotation to a version
  addAnnotation(documentId: string, versionNumber: number, annotation: string): boolean {
    const history = this.getVersionHistory(documentId);
    const version = history.versions.find(v => v.versionNumber === versionNumber);
    
    if (!version) return false;

    version.tags = version.tags || [];
    version.tags.push(annotation);
    
    this.saveVersionHistory(documentId, history);
    return true;
  }

  // Search versions by comment or content
  searchVersions(documentId: string, query: string): DocumentVersion[] {
    const history = this.getVersionHistory(documentId);
    const lowerQuery = query.toLowerCase();

    return history.versions.filter(v =>
      v.comment?.toLowerCase().includes(lowerQuery) ||
      v.content.toLowerCase().includes(lowerQuery) ||
      v.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  // Get version statistics
  getVersionStats(documentId: string): {
    totalVersions: number;
    totalChanges: number;
    averageChangesPerVersion: number;
    mostActiveEditor: { userId: string; name: string; count: number } | null;
    largestVersion: { versionNumber: number; size: number } | null;
  } {
    const history = this.getVersionHistory(documentId);
    
    if (history.versions.length === 0) {
      return {
        totalVersions: 0,
        totalChanges: 0,
        averageChangesPerVersion: 0,
        mostActiveEditor: null,
        largestVersion: null
      };
    }

    const editorCounts: Map<string, { name: string; count: number }> = new Map();
    let totalChanges = 0;
    let largestVersion = { versionNumber: 0, size: 0 };

    for (const version of history.versions) {
      totalChanges += version.changes.length;
      
      const editor = editorCounts.get(version.createdBy) || { name: version.createdByName, count: 0 };
      editor.count++;
      editorCounts.set(version.createdBy, editor);

      if (version.size > largestVersion.size) {
        largestVersion = { versionNumber: version.versionNumber, size: version.size };
      }
    }

    let mostActiveEditor: { userId: string; name: string; count: number } | null = null;
    for (const [userId, data] of editorCounts.entries()) {
      if (!mostActiveEditor || data.count > mostActiveEditor.count) {
        mostActiveEditor = { userId, name: data.name, count: data.count };
      }
    }

    return {
      totalVersions: history.totalVersions,
      totalChanges,
      averageChangesPerVersion: totalChanges / history.totalVersions,
      mostActiveEditor,
      largestVersion
    };
  }

  // Private helper methods
  private saveVersionHistory(documentId: string, history: VersionHistory): void {
    localStorage.setItem(`${this.STORAGE_KEY}_${documentId}`, JSON.stringify(history));
  }

  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private calculateChanges(oldContent: string, newContent: string): VersionChange[] {
    const changes: VersionChange[] = [];
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      if (oldLines[i] !== newLines[i]) {
        if (oldLines[i] === undefined) {
          changes.push({ type: 'added', lineNumber: i + 1, newValue: newLines[i] });
        } else if (newLines[i] === undefined) {
          changes.push({ type: 'removed', lineNumber: i + 1, oldValue: oldLines[i] });
        } else {
          changes.push({ type: 'modified', lineNumber: i + 1, oldValue: oldLines[i], newValue: newLines[i] });
        }
      }
    }

    return changes;
  }
}

export const documentVersionService = new DocumentVersionService();
