/**
 * Dark Mode Service
 * Handles dark mode and OLED mode preferences
 */

export class DarkModeService {
  private static instance: DarkModeService;
  private isDarkMode: boolean = false;
  private isOledMode: boolean = false;
  private listeners: Array<(isDark: boolean, isOled: boolean) => void> = [];

  private constructor() {
    // Initialize dark mode service
    this.initializeDarkMode();
  }

  static getInstance(): DarkModeService {
    if (!DarkModeService.instance) {
      DarkModeService.instance = new DarkModeService();
    }
    return DarkModeService.instance;
  }

  /**
   * Initialize dark mode service
   */
  private initializeDarkMode(): void {
    // Check for saved preference in localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedOledMode = localStorage.getItem('oledMode');
    
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'dark';
    } else {
      // Check system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = mediaQuery.matches;
      
      // Listen for system preference changes
      mediaQuery.addEventListener('change', (e) => {
        this.isDarkMode = e.matches;
        this.applyDarkMode();
        this.notifyListeners();
      });
    }
    
    if (savedOledMode) {
      this.isOledMode = savedOledMode === 'true';
    }
    
    // Apply initial dark mode
    this.applyDarkMode();
  }

  /**
   * Apply dark mode to the document
   */
  private applyDarkMode(): void {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      
      if (this.isOledMode) {
        document.body.classList.add('oled-mode');
      } else {
        document.body.classList.remove('oled-mode');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode', 'oled-mode');
    }
  }

  /**
   * Enable dark mode
   */
  enableDarkMode(): void {
    this.isDarkMode = true;
    localStorage.setItem('darkMode', 'dark');
    this.applyDarkMode();
    this.notifyListeners();
  }

  /**
   * Disable dark mode
   */
  disableDarkMode(): void {
    this.isDarkMode = false;
    localStorage.setItem('darkMode', 'light');
    this.applyDarkMode();
    this.notifyListeners();
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    if (this.isDarkMode) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  /**
   * Enable OLED mode
   */
  enableOledMode(): void {
    this.isOledMode = true;
    localStorage.setItem('oledMode', 'true');
    this.applyDarkMode();
    this.notifyListeners();
  }

  /**
   * Disable OLED mode
   */
  disableOledMode(): void {
    this.isOledMode = false;
    localStorage.setItem('oledMode', 'false');
    this.applyDarkMode();
    this.notifyListeners();
  }

  /**
   * Toggle OLED mode
   */
  toggleOledMode(): void {
    if (this.isOledMode) {
      this.disableOledMode();
    } else {
      this.enableOledMode();
    }
  }

  /**
   * Check if dark mode is enabled
   */
  isDarkModeEnabled(): boolean {
    return this.isDarkMode;
  }

  /**
   * Check if OLED mode is enabled
   */
  isOledModeEnabled(): boolean {
    return this.isOledMode;
  }

  /**
   * Add listener for dark mode changes
   */
  addListener(callback: (isDark: boolean, isOled: boolean) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove listener for dark mode changes
   */
  removeListener(callback: (isDark: boolean, isOled: boolean) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners of dark mode changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isDarkMode, this.isOledMode));
  }

  /**
   * Apply theme CSS variables
   */
  applyThemeVariables(): void {
    const root = document.documentElement;
    
    if (this.isDarkMode) {
      root.style.setProperty('--background-color', this.isOledMode ? '#000000' : '#1a1a1a');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--accent-color', '#4d9eff');
      root.style.setProperty('--border-color', '#333333');
    } else {
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--accent-color', '#007bff');
      root.style.setProperty('--border-color', '#dee2e6');
    }
  }
}

// Export a singleton instance
export const darkModeService = DarkModeService.getInstance();