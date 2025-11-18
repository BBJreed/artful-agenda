/**
 * Plugin Manager Service
 * Provides a plugin architecture for extending Artful Agenda functionality
 */

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  init?: () => void;
  destroy?: () => void;
  [key: string]: any; // Allow plugins to define custom methods
}

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Register a new plugin
   */
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with ID ${plugin.id} is already registered`);
      return;
    }

    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin registered: ${plugin.name} (${plugin.id})`);

    // Initialize plugin if it has an init method and is enabled
    if (plugin.enabled && plugin.init) {
      try {
        plugin.init();
        console.log(`Plugin initialized: ${plugin.name}`);
      } catch (error) {
        console.error(`Failed to initialize plugin ${plugin.name}:`, error);
      }
    }
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin with ID ${pluginId} is not registered`);
      return;
    }

    // Destroy plugin if it has a destroy method
    if (plugin.destroy) {
      try {
        plugin.destroy();
        console.log(`Plugin destroyed: ${plugin.name}`);
      } catch (error) {
        console.error(`Failed to destroy plugin ${plugin.name}:`, error);
      }
    }

    this.plugins.delete(pluginId);
    console.log(`Plugin unregistered: ${plugin.name}`);
  }

  /**
   * Enable a plugin
   */
  enablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin with ID ${pluginId} is not registered`);
      return;
    }

    if (plugin.enabled) {
      console.log(`Plugin ${plugin.name} is already enabled`);
      return;
    }

    plugin.enabled = true;
    console.log(`Plugin enabled: ${plugin.name}`);

    // Initialize plugin if it has an init method
    if (plugin.init) {
      try {
        plugin.init();
        console.log(`Plugin initialized: ${plugin.name}`);
      } catch (error) {
        console.error(`Failed to initialize plugin ${plugin.name}:`, error);
      }
    }
  }

  /**
   * Disable a plugin
   */
  disablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin with ID ${pluginId} is not registered`);
      return;
    }

    if (!plugin.enabled) {
      console.log(`Plugin ${plugin.name} is already disabled`);
      return;
    }

    plugin.enabled = false;
    console.log(`Plugin disabled: ${plugin.name}`);

    // Destroy plugin if it has a destroy method
    if (plugin.destroy) {
      try {
        plugin.destroy();
        console.log(`Plugin destroyed: ${plugin.name}`);
      } catch (error) {
        console.error(`Failed to destroy plugin ${plugin.name}:`, error);
      }
    }
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Register a hook for plugins to extend functionality
   */
  registerHook(hookName: string, callback: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    this.hooks.get(hookName)!.push(callback);
    console.log(`Hook registered: ${hookName}`);
  }

  /**
   * Trigger a hook with optional parameters
   */
  triggerHook(hookName: string, ...args: any[]): any[] {
    const callbacks = this.hooks.get(hookName);
    if (!callbacks || callbacks.length === 0) {
      return [];
    }

    console.log(`Hook triggered: ${hookName}`);
    return callbacks.map(callback => {
      try {
        return callback(...args);
      } catch (error) {
        console.error(`Error in hook ${hookName}:`, error);
        return null;
      }
    });
  }

  /**
   * Load plugins from a configuration
   */
  async loadPluginsFromConfig(config: any[]): Promise<void> {
    console.log('Loading plugins from configuration...');
    
    for (const pluginConfig of config) {
      try {
        // In a real application, this would dynamically import the plugin
        // For demo purposes, we'll create mock plugins
        const mockPlugin: Plugin = {
          id: pluginConfig.id,
          name: pluginConfig.name,
          version: pluginConfig.version || '1.0.0',
          description: pluginConfig.description || '',
          author: pluginConfig.author || 'Unknown',
          enabled: pluginConfig.enabled !== false, // Default to true if not specified
          init: () => console.log(`Initializing ${pluginConfig.name}`),
          destroy: () => console.log(`Destroying ${pluginConfig.name}`)
        };

        this.registerPlugin(mockPlugin);
      } catch (error) {
        console.error(`Failed to load plugin ${pluginConfig.id}:`, error);
      }
    }
  }

  /**
   * Get plugin statistics
   */
  getPluginStats(): {
    total: number;
    enabled: number;
    disabled: number;
  } {
    const plugins = this.getPlugins();
    const enabled = plugins.filter(plugin => plugin.enabled).length;
    
    return {
      total: plugins.length,
      enabled,
      disabled: plugins.length - enabled
    };
  }
}

// Export a singleton instance
export const pluginManager = PluginManager.getInstance();

// Example plugin hooks that can be used in the application
export const PLUGIN_HOOKS = {
  CALENDAR_EVENT_CREATED: 'calendar:event:created',
  CALENDAR_EVENT_UPDATED: 'calendar:event:updated',
  CALENDAR_EVENT_DELETED: 'calendar:event:deleted',
  TASK_CREATED: 'task:created',
  TASK_COMPLETED: 'task:completed',
  STICKER_ADDED: 'sticker:added',
  STICKER_MOVED: 'sticker:moved',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout'
};