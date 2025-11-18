import { useState, useEffect, useCallback } from 'react';

export type ColorScheme = 'light' | 'dark' | 'oled' | 'auto';
export type ThemeTransition = 'fade' | 'slide' | 'none';

interface ThemePreferences {
  colorScheme: ColorScheme;
  transition: ThemeTransition;
  enableTransitions: boolean;
  enableSystemTracking: boolean;
}

export const useDarkMode = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('auto');
  const [resolvedColorScheme, setResolvedColorScheme] = useState<'light' | 'dark' | 'oled'>('light');
  const [preferences, setPreferences] = useState<ThemePreferences>({
    colorScheme: 'auto',
    transition: 'fade',
    enableTransitions: true,
    enableSystemTracking: true
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get system preference
  const getSystemPreference = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Resolve the actual color scheme based on preferences
  const resolveColorScheme = useCallback((scheme: ColorScheme): 'light' | 'dark' | 'oled' => {
    if (scheme === 'auto') {
      return getSystemPreference();
    }
    return scheme === 'oled' ? 'dark' : scheme;
  }, [getSystemPreference]);

  // Check system preference and local storage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem('themePreferences');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences);
        setPreferences(parsed);
        setColorScheme(parsed.colorScheme);
        setResolvedColorScheme(resolveColorScheme(parsed.colorScheme));
      } catch {
        // Fallback to defaults
        setColorScheme('auto');
        setResolvedColorScheme(systemPrefersDark ? 'dark' : 'light');
      }
    } else {
      setColorScheme('auto');
      setResolvedColorScheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, [resolveColorScheme]);

  // Apply theme classes to document
  useEffect(() => {
    const applyTheme = async () => {
      if (preferences.enableTransitions && preferences.transition !== 'none') {
        setIsTransitioning(true);
        // Add transition class
        document.documentElement.classList.add(`theme-transition-${preferences.transition}`);
        // Wait for transition to start
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Remove all theme classes
      document.documentElement.classList.remove('light-mode', 'dark-mode', 'oled-mode');
      
      // Add appropriate theme class
      if (resolvedColorScheme === 'oled') {
        document.documentElement.classList.add('oled-mode');
      } else if (resolvedColorScheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.add('light-mode');
      }

      // Remove transition class after transition completes
      if (preferences.enableTransitions && preferences.transition !== 'none') {
        setTimeout(() => {
          document.documentElement.classList.remove(`theme-transition-${preferences.transition}`);
          setIsTransitioning(false);
        }, 300);
      }
    };

    applyTheme();
  }, [resolvedColorScheme, preferences]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('themePreferences', JSON.stringify({
      ...preferences,
      colorScheme
    }));
  }, [colorScheme, preferences]);

  // Track system preference changes
  useEffect(() => {
    if (!preferences.enableSystemTracking || colorScheme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setResolvedColorScheme(resolveColorScheme('auto'));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorScheme, preferences.enableSystemTracking, resolveColorScheme]);

  // Set color scheme
  const setColorSchemeAndResolve = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
    setResolvedColorScheme(resolveColorScheme(scheme));
  }, [resolveColorScheme]);

  // Toggle between light and dark/oled modes
  const toggleDarkMode = useCallback(() => {
    if (colorScheme === 'auto') {
      // If auto, set to light or dark based on current resolved scheme
      setColorSchemeAndResolve(resolvedColorScheme === 'light' ? 'dark' : 'light');
    } else if (colorScheme === 'light') {
      setColorSchemeAndResolve('dark');
    } else if (colorScheme === 'dark') {
      setColorSchemeAndResolve('oled');
    } else {
      setColorSchemeAndResolve('light');
    }
  }, [colorScheme, resolvedColorScheme, setColorSchemeAndResolve]);

  // Toggle OLED mode
  const toggleOledMode = useCallback(() => {
    if (resolvedColorScheme === 'oled') {
      setColorSchemeAndResolve('dark');
    } else {
      setColorSchemeAndResolve('oled');
    }
  }, [resolvedColorScheme, setColorSchemeAndResolve]);

  // Enable dark mode
  const enableDarkMode = useCallback(() => {
    setColorSchemeAndResolve('dark');
  }, [setColorSchemeAndResolve]);

  // Disable dark mode (set to light)
  const disableDarkMode = useCallback(() => {
    setColorSchemeAndResolve('light');
  }, [setColorSchemeAndResolve]);

  // Enable OLED mode
  const enableOledMode = useCallback(() => {
    setColorSchemeAndResolve('oled');
  }, [setColorSchemeAndResolve]);

  // Disable OLED mode but keep dark mode
  const disableOledMode = useCallback(() => {
    if (resolvedColorScheme === 'oled') {
      setColorSchemeAndResolve('dark');
    }
  }, [resolvedColorScheme, setColorSchemeAndResolve]);

  // Set theme transition
  const setThemeTransition = useCallback((transition: ThemeTransition) => {
    setPreferences(prev => ({
      ...prev,
      transition
    }));
  }, []);

  // Toggle transitions
  const toggleTransitions = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      enableTransitions: !prev.enableTransitions
    }));
  }, []);

  // Toggle system tracking
  const toggleSystemTracking = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      enableSystemTracking: !prev.enableSystemTracking
    }));
  }, []);

  // Reset to system preference
  const resetToSystem = useCallback(() => {
    setColorSchemeAndResolve('auto');
  }, [setColorSchemeAndResolve]);

  return {
    // Current state
    colorScheme,
    resolvedColorScheme,
    isDarkMode: resolvedColorScheme !== 'light',
    isOledMode: resolvedColorScheme === 'oled',
    isTransitioning,
    preferences,
    
    // Actions
    setColorScheme: setColorSchemeAndResolve,
    toggleDarkMode,
    toggleOledMode,
    enableDarkMode,
    disableDarkMode,
    enableOledMode,
    disableOledMode,
    setThemeTransition,
    toggleTransitions,
    toggleSystemTracking,
    resetToSystem
  };
};