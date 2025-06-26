import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<{ data: T }>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await apiFunction(...args);
        setState(prev => ({ ...prev, data: response.data, isLoading: false }));
        return response.data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        throw error;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}