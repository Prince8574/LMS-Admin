import { useState, useEffect } from 'react';

/**
 * useServerStatus — polls a health endpoint and returns live server status
 * @param {string} url - health check URL
 * @param {number} interval - polling interval in ms (default 30s)
 */
export function useServerStatus(url, interval = 30000) {
  const [status, setStatus] = useState({
    label: 'Checking...',
    color: '#f59e0b',
    dot: '#f59e0b',
    detail: null,
    latency: null,
    lastCheck: null,
  });

  useEffect(() => {
    const check = async () => {
      const start = Date.now();
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        const latency = Date.now() - start;
        const data = await res.json();

        if (res.ok && (data.status === 'OK' || data.status === 'ok')) {
          setStatus({
            label: 'Operational',
            color: '#4ade80',
            dot: '#4ade80',
            detail: `DB: ${data.db || 'connected'} · ${latency}ms`,
            latency,
            lastCheck: new Date().toLocaleTimeString(),
          });
        } else {
          setStatus({
            label: 'Offline',
            color: '#ef4444',
            dot: '#ef4444',
            detail: 'Server responded with error',
            latency,
            lastCheck: new Date().toLocaleTimeString(),
          });
        }
      } catch (err) {
        setStatus({
          label: 'Offline',
          color: '#ef4444',
          dot: '#ef4444',
          detail: `Cannot reach server — ${err.message}`,
          latency: null,
          lastCheck: new Date().toLocaleTimeString(),
        });
      }
    };

    check();
    const id = setInterval(check, interval);
    return () => clearInterval(id);
  }, [url, interval]);

  return status;
}
