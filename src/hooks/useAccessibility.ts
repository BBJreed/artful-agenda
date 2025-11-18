import { useState, useEffect, useCallback, useRef } from 'react';

export const useAccessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(true);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');
  
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Check for accessibility preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    // Check for high contrast preference
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastMediaQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    contrastMediaQuery.addEventListener('change', handleContrastChange);
    
    // Check for screen reader (approximate detection)
    const handleFocusVisible = () => {
      setIsScreenReaderActive(true);
    };
    
    document.addEventListener('focusin', handleFocusVisible);
    
    // Check for keyboard navigation
    const handleKeyDown = () => {
      setIsKeyboardNavigation(true);
    };
    
    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('focusin', handleFocusVisible);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply accessibility settings to the document
  useEffect(() => {
    // Apply font size class
    document.body.className = document.body.className
      .replace(/font-size-\w+/g, '')
      .trim();
    
    if (fontSize !== 'medium') {
      document.body.classList.add(`font-size-${fontSize}`);
    }
    
    // Apply high contrast class
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply reduced motion class
    if (isReducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Apply color blind mode
    document.body.className = document.body.className
      .replace(/color-blind-\w+/g, '')
      .trim();
    
    if (colorBlindMode !== 'none') {
      document.body.classList.add(`color-blind-${colorBlindMode}`);
    }
    
    // Apply keyboard navigation class
    if (isKeyboardNavigation) {
      document.body.classList.add('keyboard-navigation');
    } else {
      document.body.classList.remove('keyboard-navigation');
    }
  }, [fontSize, isHighContrast, isReducedMotion, colorBlindMode, isKeyboardNavigation]);

  // Keyboard navigation helper
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    // Skip to content
    if (event.altKey && event.key === 'S') {
      const mainContent = document.querySelector('main') || document.querySelector('.app-main');
      if (mainContent) {
        (mainContent as HTMLElement).focus();
        event.preventDefault();
      }
    }
    
    // Skip to navigation
    if (event.altKey && event.key === 'N') {
      const nav = document.querySelector('nav') || document.querySelector('.main-nav');
      if (nav) {
        (nav as HTMLElement).focus();
        event.preventDefault();
      }
    }
    
    // Focus trap for modals
    if (event.key === 'Tab') {
      const modal = document.querySelector('.modal[aria-hidden="false"]');
      if (modal) {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }, []);

  // Focus management helper
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement | null;
    if (element) {
      // Save the last focused element
      lastFocusedElement.current = document.activeElement as HTMLElement | null;
      element.focus();
    }
  }, []);

  // Return focus to the last element
  const returnFocus = useCallback(() => {
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    }
  }, []);

  // Announce messages to screen readers
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or reuse aria-live region
    let liveRegion = document.getElementById('screen-reader-announcer');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-announcer';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.top = 'auto';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    // Clear previous content to ensure screen reader announces the message
    liveRegion.textContent = '';
    
    // Set new content after a small delay to ensure the screen reader announces it
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);
  }, []);

  // Generate ARIA labels for elements
  const generateAriaLabel = useCallback((elementType: string, content: string, additionalInfo?: string) => {
    let label = `${elementType}: ${content}`;
    if (additionalInfo) {
      label += ` - ${additionalInfo}`;
    }
    return label;
  }, []);

  return {
    isHighContrast,
    isReducedMotion,
    fontSize,
    setFontSize,
    isScreenReaderActive,
    isKeyboardNavigation,
    colorBlindMode,
    setColorBlindMode,
    handleKeyboardNavigation,
    focusElement,
    returnFocus,
    announceToScreenReader,
    generateAriaLabel
  };
};