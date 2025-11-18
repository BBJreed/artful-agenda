/**
 * Focus Management Service
 * Handles keyboard navigation and focus management for improved accessibility
 */

export class FocusManager {
  private static instance: FocusManager;
  private focusableElements: HTMLElement[] = [];
  private currentIndex: number = 0;
  private isModalOpen: boolean = false;

  private constructor() {
    this.initializeFocusManagement();
  }

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  /**
   * Initialize focus management
   */
  private initializeFocusManagement(): void {
    // Set up global keyboard event listeners
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
    
    // Update focusable elements when DOM changes
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Initial update
    this.updateFocusableElements();
  }

  /**
   * Handle global keyboard events
   */
  private handleGlobalKeyDown(event: KeyboardEvent): void {
    // Skip if in a modal or input field
    if (this.isModalOpen || this.isInInputField()) return;
    
    // Tab navigation
    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
      return;
    }
    
    // Arrow key navigation for calendar grid
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      this.handleArrowNavigation(event);
      return;
    }
    
    // Space and Enter for activation
    if (event.key === ' ' || event.key === 'Enter') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        activeElement.click();
      }
      return;
    }
    
    // Escape to close modals or return to main view
    if (event.key === 'Escape') {
      this.handleEscapeKey();
      return;
    }
  }

  /**
   * Check if current focus is in an input field
   */
  private isInInputField(): boolean {
    const activeElement = document.activeElement;
    return activeElement?.tagName === 'INPUT' || 
           activeElement?.tagName === 'TEXTAREA' ||
           activeElement?.getAttribute('contenteditable') === 'true';
  }

  /**
   * Update the list of focusable elements
   */
  private updateFocusableElements(): void {
    const focusableSelectors = [
      'button',
      'a[href]',
      'input',
      'textarea',
      'select',
      '[tabindex]:not([tabindex="-1"])',
      '.focusable' // Custom focusable elements
    ];
    
    const elements = document.querySelectorAll<HTMLElement>(focusableSelectors.join(', '));
    this.focusableElements = Array.from(elements).filter(el => 
      el.offsetWidth > 0 && 
      el.offsetHeight > 0 && 
      (el as any).disabled !== true
    );
  }

  /**
   * Focus the next element in the sequence
   */
  private focusNext(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex].focus();
  }

  /**
   * Focus the previous element in the sequence
   */
  private focusPrevious(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
    this.focusableElements[this.currentIndex].focus();
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowNavigation(event: KeyboardEvent): void {
    // This would be customized based on the current view
    // For calendar grid navigation, we would move focus in a 2D grid pattern
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return;
    
    // Prevent default behavior
    event.preventDefault();
    
    // In a real implementation, this would calculate the next focusable element
    // based on the grid structure of the calendar
    console.log(`Arrow key navigation: ${event.key}`);
  }

  /**
   * Handle escape key
   */
  private handleEscapeKey(): void {
    // Close modals, dropdowns, or return to main view
    const event = new CustomEvent('escapeKeyPressed');
    document.dispatchEvent(event);
  }

  /**
   * Set focus to a specific element
   */
  focusElement(element: HTMLElement): void {
    const index = this.focusableElements.indexOf(element);
    if (index !== -1) {
      this.currentIndex = index;
      element.focus();
    }
  }

  /**
   * Set focus to the first element
   */
  focusFirst(): void {
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0;
      this.focusableElements[0].focus();
    }
  }

  /**
   * Set focus to the last element
   */
  focusLast(): void {
    if (this.focusableElements.length > 0) {
      this.currentIndex = this.focusableElements.length - 1;
      this.focusableElements[this.currentIndex].focus();
    }
  }

  /**
   * Set modal state
   */
  setModalState(isOpen: boolean): void {
    this.isModalOpen = isOpen;
    
    if (isOpen) {
      // When modal opens, save current focus and trap focus within modal
      this.updateFocusableElements();
    } else {
      // When modal closes, restore focus to previous element
      this.updateFocusableElements();
    }
  }

  /**
   * Get current focusable elements
   */
  getFocusableElements(): HTMLElement[] {
    return [...this.focusableElements];
  }

  /**
   * Register a custom focusable element
   */
  registerFocusableElement(element: HTMLElement): void {
    if (!this.focusableElements.includes(element)) {
      this.focusableElements.push(element);
    }
  }

  /**
   * Unregister a focusable element
   */
  unregisterFocusableElement(element: HTMLElement): void {
    const index = this.focusableElements.indexOf(element);
    if (index !== -1) {
      this.focusableElements.splice(index, 1);
      
      // Adjust current index if necessary
      if (index <= this.currentIndex) {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
      }
    }
  }
}

// Export a singleton instance
export const focusManager = FocusManager.getInstance();