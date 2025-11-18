/**
 * Accessibility Service
 * Provides enhanced accessibility features for users with disabilities
 */

export class AccessibilityService {
  private static instance: AccessibilityService;
  private isHighContrastMode: boolean = false;
  private isFocusVisible: boolean = true;
  private keyboardNavigationEnabled: boolean = true;

  private constructor() {
    // Check for saved accessibility preferences
    this.loadPreferences();
  }

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrastMode(): void {
    this.isHighContrastMode = !this.isHighContrastMode;
    this.applyHighContrastMode();
    this.savePreferences();
  }

  /**
   * Apply high contrast mode styles
   */
  private applyHighContrastMode(): void {
    if (this.isHighContrastMode) {
      document.body.classList.add('high-contrast-mode');
      this.injectHighContrastStyles();
    } else {
      document.body.classList.remove('high-contrast-mode');
      this.removeHighContrastStyles();
    }
  }

  /**
   * Inject high contrast CSS styles
   */
  private injectHighContrastStyles(): void {
    const styleId = 'high-contrast-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .high-contrast-mode {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      
      .high-contrast-mode button,
      .high-contrast-mode .button {
        background-color: #ffff00 !important;
        color: #000000 !important;
        border: 2px solid #ffffff !important;
      }
      
      .high-contrast-mode input,
      .high-contrast-mode textarea {
        background-color: #000000 !important;
        color: #ffff00 !important;
        border: 2px solid #ffff00 !important;
      }
      
      .high-contrast-mode a {
        color: #00ffff !important;
        text-decoration: underline !important;
      }
      
      .high-contrast-mode .calendar-event {
        background-color: #00ffff !important;
        color: #000000 !important;
        border: 2px solid #ffffff !important;
      }
      
      .high-contrast-mode .task-item {
        background-color: #ff00ff !important;
        color: #ffffff !important;
        border: 2px solid #ffffff !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove high contrast CSS styles
   */
  private removeHighContrastStyles(): void {
    const style = document.getElementById('high-contrast-styles');
    if (style) {
      style.remove();
    }
  }

  /**
   * Enable/disable focus visibility
   */
  toggleFocusVisibility(): void {
    this.isFocusVisible = !this.isFocusVisible;
    this.applyFocusVisibility();
    this.savePreferences();
  }

  /**
   * Apply focus visibility settings
   */
  private applyFocusVisibility(): void {
    if (this.isFocusVisible) {
      document.body.classList.remove('no-focus-outline');
    } else {
      document.body.classList.add('no-focus-outline');
    }
  }

  /**
   * Enable/disable keyboard navigation
   */
  toggleKeyboardNavigation(): void {
    this.keyboardNavigationEnabled = !this.keyboardNavigationEnabled;
    this.savePreferences();
  }

  /**
   * Check if keyboard navigation is enabled
   */
  isKeyboardNavigationEnabled(): boolean {
    return this.keyboardNavigationEnabled;
  }

  /**
   * Generate ARIA labels for calendar events
   */
  generateEventAriaLabel(event: any): string {
    const startTime = event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${event.title}, from ${startTime} to ${endTime}`;
  }

  /**
   * Generate ARIA labels for tasks
   */
  generateTaskAriaLabel(task: any): string {
    const status = task.completed ? 'completed' : 'not completed';
    return `${task.content}, ${status}`;
  }

  /**
   * Generate ARIA labels for calendar days
   */
  generateDayAriaLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  /**
   * Announce messages to screen readers
   */
  announceToScreenReader(message: string): void {
    // Create a temporary element for screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.top = 'auto';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove the element after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Handle keyboard shortcuts for accessibility
   */
  handleKeyboardShortcut(event: KeyboardEvent): boolean {
    if (!this.keyboardNavigationEnabled) return false;

    // Skip if modifier keys are pressed
    if (event.ctrlKey || event.metaKey || event.altKey) return false;

    switch (event.key) {
      case 'h':
        if (event.shiftKey) {
          this.toggleHighContrastMode();
          this.announceToScreenReader(
            this.isHighContrastMode 
              ? 'High contrast mode enabled' 
              : 'High contrast mode disabled'
          );
          event.preventDefault();
          return true;
        }
        break;
        
      case 'f':
        if (event.shiftKey) {
          this.toggleFocusVisibility();
          this.announceToScreenReader(
            this.isFocusVisible 
              ? 'Focus visibility enabled' 
              : 'Focus visibility disabled'
          );
          event.preventDefault();
          return true;
        }
        break;
        
      case 'k':
        if (event.shiftKey) {
          this.toggleKeyboardNavigation();
          this.announceToScreenReader(
            this.keyboardNavigationEnabled 
              ? 'Keyboard navigation enabled' 
              : 'Keyboard navigation disabled'
          );
          event.preventDefault();
          return true;
        }
        break;
    }
    
    return false;
  }

  /**
   * Save accessibility preferences to localStorage
   */
  private savePreferences(): void {
    try {
      const preferences = {
        highContrast: this.isHighContrastMode,
        focusVisible: this.isFocusVisible,
        keyboardNav: this.keyboardNavigationEnabled
      };
      localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error);
    }
  }

  /**
   * Load accessibility preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const preferencesStr = localStorage.getItem('accessibilityPreferences');
      if (preferencesStr) {
        const preferences = JSON.parse(preferencesStr);
        this.isHighContrastMode = preferences.highContrast ?? false;
        this.isFocusVisible = preferences.focusVisible ?? true;
        this.keyboardNavigationEnabled = preferences.keyboardNav ?? true;
        
        // Apply loaded preferences
        this.applyHighContrastMode();
        this.applyFocusVisibility();
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error);
    }
  }

  /**
   * Get current accessibility settings
   */
  getSettings(): {
    highContrast: boolean;
    focusVisible: boolean;
    keyboardNavigation: boolean;
  } {
    return {
      highContrast: this.isHighContrastMode,
      focusVisible: this.isFocusVisible,
      keyboardNavigation: this.keyboardNavigationEnabled
    };
  }
}

// Export a singleton instance
export const accessibilityService = AccessibilityService.getInstance();