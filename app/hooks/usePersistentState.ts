'use client';

import { useEffect, useState } from "react";

type Initializer<T> = () => T;

export function usePersistentState<T>(
  key: string,
  initializer: Initializer<T>
) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initializer();
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        const value = initializer();
        window.localStorage.setItem(key, JSON.stringify(value));
        return value;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[usePersistentState] failed to read ${key}`, error);
      const value = initializer();
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (writeError) {
          console.warn(`[usePersistentState] failed to write fallback for ${key}`, writeError);
        }
      }
      return value;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`[usePersistentState] failed to persist ${key}`, error);
    }
  }, [key, state]);

  return [state, setState] as const;
}
