import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export const useLoading = (initialState: Partial<LoadingState> = {}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialState.isLoading || false,
    error: initialState.error || null,
    success: initialState.success || null
  });

  const startLoading = useCallback(() => {
    setLoadingState({
      isLoading: true,
      error: null,
      success: null
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setLoadingState({
      isLoading: false,
      error,
      success: null
    });
  }, []);

  const setSuccess = useCallback((success: string) => {
    setLoadingState({
      isLoading: false,
      error: null,
      success
    });
  }, []);

  const reset = useCallback(() => {
    setLoadingState({
      isLoading: false,
      error: null,
      success: null
    });
  }, []);

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    setError,
    setSuccess,
    reset
  };
};