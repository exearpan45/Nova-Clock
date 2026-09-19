import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }, [key, value]);

  const update = useCallback((next: T | ((current: T) => T)) => {
    setValue((current) => typeof next === 'function' ? (next as (current: T) => T)(current) : next);
  }, []);
  return [value, update] as const;
}

export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function formatTime(date: Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options ?? { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function timezoneCity(timezone: string) {
  return timezone.split('/').pop()?.replaceAll('_', ' ') ?? timezone;
}