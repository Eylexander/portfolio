import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

// undefined = not yet fetched, null = unreachable/unconfigured, string[] = reachable
let cachedModels: string[] | null | undefined = undefined;
let pendingPromise: Promise<string[] | null> | null = null;

interface OllamaState {
  isConfigured: boolean;
  models: string[];
}

export function useOllama(): OllamaState {
  const [models, setModels] = useState<string[] | null>(
    cachedModels === undefined ? null : cachedModels
  );

  useEffect(() => {
    if (cachedModels !== undefined) {
      setModels(cachedModels);
      return;
    }
    if (!pendingPromise) {
      pendingPromise = apiClient.getOllamaModels().then((result) => {
        cachedModels = result;
        return result;
      });
    }
    pendingPromise.then(setModels);
  }, []);

  return {
    isConfigured: models !== null,
    models: models ?? [],
  };
}
