/**
 * Advanced Search & Filtering Engine
 * Cross-system search with filters, facets, and aggregations
 */

interface SearchableItem {
  id: string;
  type: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  owner?: string;
  status?: string;
}

interface SearchQuery {
  q: string;
  filters?: Record<string, string | string[]>;
  facets?: string[];
  sort?: { field: string; order: "asc" | "desc" }[];
  limit?: number;
  offset?: number;
}

interface SearchResult {
  items: SearchableItem[];
  total: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
  took: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
}

class AdvancedSearchService {
  private index: Map<string, SearchableItem> = new Map();
  private savedSearches: Map<string, SavedSearch> = new Map();
  private searchHistory: Array<{ query: string; timestamp: Date; userId: string }> = [];
  private readonly HISTORY_LIMIT = 1000;

  /**
   * Index item for search
   */
  indexItem(item: SearchableItem): void {
    this.index.set(item.id, item);
  }

  /**
   * Index multiple items
   */
  indexItems(items: SearchableItem[]): void {
    for (const item of items) {
      this.indexItem(item);
    }
  }

  /**
   * Remove item from index
   */
  removeItem(itemId: string): boolean {
    return this.index.delete(itemId);
  }

  /**
   * Execute search
   */
  search(query: SearchQuery, userId?: string): SearchResult {
    const startTime = Date.now();
    let results = Array.from(this.index.values());

    // Text search
    if (query.q) {
      const searchTerms = query.q.toLowerCase().split(/\s+/);
      results = results.filter((item) => {
        const searchText = `${item.title} ${item.description} ${item.content} ${item.tags.join(" ")}`.toLowerCase();
        return searchTerms.every((term) => searchText.includes(term));
      });
    }

    // Apply filters
    if (query.filters) {
      for (const [field, value] of Object.entries(query.filters)) {
        const values = Array.isArray(value) ? value : [value];

        results = results.filter((item) => {
          const fieldValue = this.getNestedValue(item, field);
          if (Array.isArray(fieldValue)) {
            return values.some((v) => fieldValue.includes(v));
          }
          return values.includes(String(fieldValue));
        });
      }
    }

    // Calculate facets
    const facets: Record<string, Array<{ value: string; count: number }>> = {};
    if (query.facets) {
      for (const facet of query.facets) {
        const facetMap = new Map<string, number>();

        for (const item of results) {
          const value = this.getNestedValue(item, facet);
          if (value) {
            const key = String(value);
            facetMap.set(key, (facetMap.get(key) || 0) + 1);
          }
        }

        facets[facet] = Array.from(facetMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count);
      }
    }

    // Sort
    if (query.sort) {
      for (const { field, order } of query.sort.reverse()) {
        results.sort((a, b) => {
          const aVal = this.getNestedValue(a, field);
          const bVal = this.getNestedValue(b, field);

          if (aVal < bVal) return order === "asc" ? -1 : 1;
          if (aVal > bVal) return order === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    // Pagination
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    const paginatedResults = results.slice(offset, offset + limit);

    // Record search history
    if (userId && query.q) {
      this.searchHistory.push({
        query: query.q,
        timestamp: new Date(),
        userId,
      });

      if (this.searchHistory.length > this.HISTORY_LIMIT) {
        this.searchHistory.shift();
      }
    }

    return {
      items: paginatedResults,
      total: results.length,
      facets,
      took: Date.now() - startTime,
    };
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Save search
   */
  saveSearch(name: string, query: SearchQuery, owner: string): SavedSearch {
    const saved: SavedSearch = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      query,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner,
    };

    this.savedSearches.set(saved.id, saved);
    return saved;
  }

  /**
   * Get saved search
   */
  getSavedSearch(searchId: string): SavedSearch | null {
    return this.savedSearches.get(searchId) || null;
  }

  /**
   * Get user's saved searches
   */
  getUserSavedSearches(owner: string): SavedSearch[] {
    return Array.from(this.savedSearches.values()).filter((s) => s.owner === owner);
  }

  /**
   * Delete saved search
   */
  deleteSavedSearch(searchId: string): boolean {
    return this.savedSearches.delete(searchId);
  }

  /**
   * Get search suggestions
   */
  getSuggestions(prefix: string, limit: number = 10): string[] {
    const suggestions = new Set<string>();

    for (const item of this.index.values()) {
      if (item.title.toLowerCase().startsWith(prefix.toLowerCase())) {
        suggestions.add(item.title);
      }

      for (const tag of item.tags) {
        if (tag.toLowerCase().startsWith(prefix.toLowerCase())) {
          suggestions.add(tag);
        }
      }

      if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get popular searches
   */
  getPopularSearches(limit: number = 10): Array<{ query: string; count: number }> {
    const queryMap = new Map<string, number>();

    for (const entry of this.searchHistory) {
      queryMap.set(entry.query, (queryMap.get(entry.query) || 0) + 1);
    }

    return Array.from(queryMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get search statistics
   */
  getStats(): {
    indexedItems: number;
    savedSearches: number;
    searchHistorySize: number;
    totalSearches: number;
  } {
    return {
      indexedItems: this.index.size,
      savedSearches: this.savedSearches.size,
      searchHistorySize: this.searchHistory.length,
      totalSearches: this.searchHistory.length,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.index.clear();
    this.savedSearches.clear();
    this.searchHistory = [];
  }
}

export const advancedSearchService = new AdvancedSearchService();
