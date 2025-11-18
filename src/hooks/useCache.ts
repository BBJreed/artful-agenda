import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum number of entries (default: 100)
  persistence?: boolean; // Whether to persist to localStorage (default: false)
  persistenceKey?: string; // Key for localStorage persistence
}

export const useCache = <T>(options: CacheOptions = {}) => {
  const {
    ttl = 300000, // 5 minutes
    maxSize = 100,
    persistence = false,
    persistenceKey = 'app-cache'
  } = options;

  const [cache, setCache] = useState<Record<string, CacheEntry<T>>>({});
  const cacheRef = useRef<Record<string, CacheEntry<T>>>(cache);

  // Load cache from localStorage if persistence is enabled
  useEffect(() => {
    if (persistence) {
      try {
        const storedCache = localStorage.getItem(persistenceKey);
        if (storedCache) {
          const parsedCache = JSON.parse(storedCache);
          // Filter out expired entries
          const now = Date.now();
          const validCache: Record<string, CacheEntry<T>> = {};
          
          Object.keys(parsedCache).forEach(key => {
            if (parsedCache[key].expiresAt > now) {
              validCache[key] = parsedCache[key];
            }
          });
          
          setCache(validCache);
          cacheRef.current = validCache;
        }
      } catch (error) {
        console.warn('Failed to load cache from localStorage:', error);
      }
    }
  }, [persistence, persistenceKey]);

  // Save cache to localStorage when it changes (if persistence is enabled)
  useEffect(() => {
    if (persistence) {
      try {
        // Filter out expired entries before saving
        const now = Date.now();
        const validCache: Record<string, CacheEntry<T>> = {};
        
        Object.keys(cacheRef.current).forEach(key => {
          if (cacheRef.current[key].expiresAt > now) {
            validCache[key] = cacheRef.current[key];
          }
        });
        
        localStorage.setItem(persistenceKey, JSON.stringify(validCache));
      } catch (error) {
        console.warn('Failed to save cache to localStorage:', error);
      }
    }
  }, [cache, persistence, persistenceKey]);

  // Get data from cache
  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current[key];
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      // Remove expired entry
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        cacheRef.current = newCache;
        return newCache;
      });
      return null;
    }
    
    return entry.data;
  }, []);

  // Set data in cache
  const set = useCallback((key: string, data: T): void => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };
    
    setCache(prev => {
      // Check if we need to remove old entries to stay within maxSize
      const keys = Object.keys(prev);
      let newCache = { ...prev };
      
      if (keys.length >= maxSize) {
        // Remove the oldest entry
        const oldestKey = keys.reduce((oldest, current) => {
          return prev[oldest].timestamp < prev[current].timestamp ? oldest : current;
        });
        delete newCache[oldestKey];
      }
      
      // Add new entry
      newCache[key] = entry;
      cacheRef.current = newCache;
      return newCache;
    });
  }, [ttl, maxSize]);

  // Remove data from cache
  const remove = useCallback((key: string): void => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      cacheRef.current = newCache;
      return newCache;
    });
  }, []);

  // Clear all cache entries
  const clear = useCallback((): void => {
    setCache({});
    cacheRef.current = {};
  }, []);

  // Check if key exists in cache
  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current[key];
    if (!entry) return false;
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      // Remove expired entry
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        cacheRef.current = newCache;
        return newCache;
      });
      return false;
    }
    
    return true;
  }, []);

  // Get cache statistics
  const getStats = useCallback(() => {
    const now = Date.now();
    const entries = Object.values(cacheRef.current);
    const validEntries = entries.filter(entry => entry.expiresAt > now);
    
    return {
      size: validEntries.length,
      maxSize,
      ttl,
      oldestEntry: validEntries.length > 0 
        ? Math.min(...validEntries.map(e => e.timestamp)) 
        : null,
      newestEntry: validEntries.length > 0 
        ? Math.max(...validEntries.map(e => e.timestamp)) 
        : null
    };
  }, [maxSize, ttl]);

  // Prefetch data (useful for warming up the cache)
  const prefetch = useCallback(async (
    key: string, 
    fetcher: () => Promise<T>
  ): Promise<void> => {
    try {
      const data = await fetcher();
      set(key, data);
    } catch (error) {
      console.warn(`Failed to prefetch data for key ${key}:`, error);
    }
  }, [set]);

  // Invalidate cache entry (force refresh on next get)
  const invalidate = useCallback((key: string): void => {
    remove(key);
  }, [remove]);

  // Bulk operations
  const bulkSet = useCallback((entries: Record<string, T>): void => {
    const now = Date.now();
    const newEntries: Record<string, CacheEntry<T>> = {};
    
    Object.keys(entries).forEach(key => {
      newEntries[key] = {
        data: entries[key],
        timestamp: now,
        expiresAt: now + ttl
      };
    });
    
    setCache(prev => {
      // Combine with existing cache, respecting maxSize
      let combinedCache = { ...prev, ...newEntries };
      const keys = Object.keys(combinedCache);
      
      if (keys.length > maxSize) {
        // Remove oldest entries to stay within maxSize
        const sortedKeys = keys.sort((a, b) => 
          combinedCache[a].timestamp - combinedCache[b].timestamp
        );
        
        const keysToRemove = sortedKeys.slice(0, keys.length - maxSize);
        keysToRemove.forEach(key => {
          delete combinedCache[key];
        });
      }
      
      cacheRef.current = combinedCache;
      return combinedCache;
    });
  }, [ttl, maxSize]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    getStats,
    prefetch,
    invalidate,
    bulkSet
  };
};

export default useCache;