/**
 * Session Management Service
 * Handles user sessions and automatic logout
 */

export class SessionManager {
  private static instance: SessionManager;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private warningTime: number = 5 * 60 * 1000; // 5 minutes before timeout
  private lastActivity: number = Date.now();
  private timeoutId: number | null = null;
  private warningTimeoutId: number | null = null;
  private isAuthenticated: boolean = false;
  private userId: string | null = null;

  private constructor() {
    this.initializeSession();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize session management
   */
  private initializeSession(): void {
    // Set up activity tracking
    this.setupActivityListeners();
    
    // Load saved session data
    this.loadSessionData();
    
    // Start session timeout
    this.startSessionTimeout();
  }

  /**
   * Set up activity listeners
   */
  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.updateLastActivity.bind(this), true);
    });
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    this.lastActivity = Date.now();
    
    // Reset timeouts
    this.resetSessionTimeout();
  }

  /**
   * Start session timeout
   */
  private startSessionTimeout(): void {
    this.resetSessionTimeout();
  }

  /**
   * Reset session timeout
   */
  private resetSessionTimeout(): void {
    // Clear existing timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }
    
    // Set warning timeout
    this.warningTimeoutId = window.setTimeout(() => {
      this.showSessionWarning();
    }, this.sessionTimeout - this.warningTime);
    
    // Set logout timeout
    this.timeoutId = window.setTimeout(() => {
      this.logout();
    }, this.sessionTimeout);
  }

  /**
   * Show session warning
   */
  private showSessionWarning(): void {
    // Dispatch event for UI to handle
    const timeLeft = Math.ceil(this.warningTime / 1000);
    const event = new CustomEvent('sessionWarning', {
      detail: { timeLeft }
    });
    document.dispatchEvent(event);
    
    console.log(`Session will expire in ${timeLeft} seconds`);
  }

  /**
   * Login user
   */
  login(userId: string): void {
    this.isAuthenticated = true;
    this.userId = userId;
    this.lastActivity = Date.now();
    
    // Save session data
    this.saveSessionData();
    
    // Start session management
    this.startSessionTimeout();
    
    // Log the login
    console.log(`User ${userId} logged in`);
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }
    
    // Update state
    this.isAuthenticated = false;
    this.userId = null;
    
    // Clear session data
    this.clearSessionData();
    
    // Dispatch logout event
    const event = new CustomEvent('userLoggedOut');
    document.dispatchEvent(event);
    
    console.log('User logged out');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * Extend session
   */
  extendSession(): void {
    this.updateLastActivity();
    console.log('Session extended');
  }

  /**
   * Set session timeout duration
   */
  setSessionTimeout(minutes: number): void {
    this.sessionTimeout = minutes * 60 * 1000;
    this.resetSessionTimeout();
  }

  /**
   * Set warning time
   */
  setWarningTime(minutes: number): void {
    this.warningTime = minutes * 60 * 1000;
    this.resetSessionTimeout();
  }

  /**
   * Get session time remaining
   */
  getTimeRemaining(): number {
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, this.sessionTimeout - elapsed);
  }

  /**
   * Save session data to localStorage
   */
  private saveSessionData(): void {
    try {
      const sessionData = {
        isAuthenticated: this.isAuthenticated,
        userId: this.userId,
        lastActivity: this.lastActivity
      };
      localStorage.setItem('sessionData', JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to save session data:', error);
    }
  }

  /**
   * Load session data from localStorage
   */
  private loadSessionData(): void {
    try {
      const sessionDataStr = localStorage.getItem('sessionData');
      if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr);
        this.isAuthenticated = sessionData.isAuthenticated || false;
        this.userId = sessionData.userId || null;
        this.lastActivity = sessionData.lastActivity || Date.now();
      }
    } catch (error) {
      console.warn('Failed to load session data:', error);
    }
  }

  /**
   * Clear session data
   */
  private clearSessionData(): void {
    localStorage.removeItem('sessionData');
  }

  /**
   * Get session statistics
   */
  getStatistics(): {
    isAuthenticated: boolean;
    timeRemaining: number;
    sessionTimeout: number;
    warningTime: number;
  } {
    return {
      isAuthenticated: this.isAuthenticated,
      timeRemaining: this.getTimeRemaining(),
      sessionTimeout: this.sessionTimeout,
      warningTime: this.warningTime
    };
  }

  /**
   * Handle page visibility changes
   */
  handlePageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, check if session is still valid
        if (this.isAuthenticated && this.getTimeRemaining() <= 0) {
          this.logout();
        }
      }
    });
  }

  /**
   * Reset session completely
   */
  reset(): void {
    this.logout();
    this.sessionTimeout = 30 * 60 * 1000;
    this.warningTime = 5 * 60 * 1000;
  }
}

// Export a singleton instance
export const sessionManager = SessionManager.getInstance();