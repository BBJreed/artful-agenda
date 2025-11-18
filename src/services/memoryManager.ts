/**
 * Memory Management Service
 * Handles automatic cleanup of unused resources to optimize performance
 */

export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupCallbacks: Map<string, () => void> = new Map();
  private resourceUsage: Map<string, { lastAccessed: number; size: number }> = new Map();
  private cleanupInterval: number | null = null;
  private maxIdleTime: number = 5 * 60 * 1000; // 5 minutes
  private maxMemoryUsage: number = 100 * 1024 * 1024; // 100MB

  private constructor() {
    this.startCleanupInterval();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register a resource for memory management
   */
  registerResource(
    id: string, 
    cleanupCallback: () => void, 
    size: number = 0
  ): void {
    this.cleanupCallbacks.set(id, cleanupCallback);
    this.resourceUsage.set(id, {
      lastAccessed: Date.now(),
      size
    });
  }

  /**
   * Unregister a resource
   */
  unregisterResource(id: string): void {
    this.cleanupCallbacks.delete(id);
    this.resourceUsage.delete(id);
  }

  /**
   * Mark a resource as accessed
   */
  accessResource(id: string): void {
    const usage = this.resourceUsage.get(id);
    if (usage) {
      usage.lastAccessed = Date.now();
      this.resourceUsage.set(id, usage);
    }
  }

  /**
   * Start the automatic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = window.setInterval(() => {
      this.performCleanup();
    }, 60 * 1000); // Check every minute
  }

  /**
   * Stop the automatic cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Perform cleanup of unused resources
   */
  private performCleanup(): void {
    const now = Date.now();
    const candidatesForCleanup: string[] = [];
    
    // Find resources that haven't been accessed for a while
    this.resourceUsage.forEach((usage, id) => {
      if (now - usage.lastAccessed > this.maxIdleTime) {
        candidatesForCleanup.push(id);
      }
    });
    
    // If we're still under memory limits, only clean up idle resources
    if (this.getCurrentMemoryUsage() < this.maxMemoryUsage) {
      this.cleanupResources(candidatesForCleanup);
      return;
    }
    
    // If we're over memory limits, clean up more aggressively
    // Sort by last accessed time (oldest first)
    candidatesForCleanup.sort((a, b) => {
      const usageA = this.resourceUsage.get(a);
      const usageB = this.resourceUsage.get(b);
      return (usageA?.lastAccessed || 0) - (usageB?.lastAccessed || 0);
    });
    
    // Clean up until we're under the memory limit
    let currentUsage = this.getCurrentMemoryUsage();
    for (const id of candidatesForCleanup) {
      if (currentUsage <= this.maxMemoryUsage) break;
      
      const usage = this.resourceUsage.get(id);
      if (usage) {
        currentUsage -= usage.size;
        this.cleanupResource(id);
      }
    }
  }

  /**
   * Clean up specific resources
   */
  private cleanupResources(ids: string[]): void {
    for (const id of ids) {
      this.cleanupResource(id);
    }
  }

  /**
   * Clean up a single resource
   */
  private cleanupResource(id: string): void {
    const cleanupCallback = this.cleanupCallbacks.get(id);
    if (cleanupCallback) {
      try {
        cleanupCallback();
        console.log(`Cleaned up resource: ${id}`);
      } catch (error) {
        console.error(`Error cleaning up resource ${id}:`, error);
      }
    }
    
    this.cleanupCallbacks.delete(id);
    this.resourceUsage.delete(id);
  }

  /**
   * Get current memory usage estimate
   */
  private getCurrentMemoryUsage(): number {
    let total = 0;
    this.resourceUsage.forEach(usage => {
      total += usage.size;
    });
    return total;
  }

  /**
   * Force immediate cleanup
   */
  forceCleanup(): void {
    this.performCleanup();
  }

  /**
   * Set maximum idle time before cleanup
   */
  setMaxIdleTime(milliseconds: number): void {
    this.maxIdleTime = milliseconds;
  }

  /**
   * Set maximum memory usage limit
   */
  setMaxMemoryUsage(bytes: number): void {
    this.maxMemoryUsage = bytes;
  }

  /**
   * Get resource usage statistics
   */
  getStatistics(): {
    totalResources: number;
    totalMemoryUsage: number;
    idleResources: number;
  } {
    const now = Date.now();
    let idleCount = 0;
    
    this.resourceUsage.forEach(usage => {
      if (now - usage.lastAccessed > this.maxIdleTime) {
        idleCount++;
      }
    });
    
    return {
      totalResources: this.resourceUsage.size,
      totalMemoryUsage: this.getCurrentMemoryUsage(),
      idleResources: idleCount
    };
  }

  /**
   * Clear all resources
   */
  clearAll(): void {
    // Call all cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    
    // Clear all maps
    this.cleanupCallbacks.clear();
    this.resourceUsage.clear();
  }

  /**
   * Destroy the memory manager
   */
  destroy(): void {
    this.stopCleanupInterval();
    this.clearAll();
  }
}

// Export a singleton instance
export const memoryManager = MemoryManager.getInstance();