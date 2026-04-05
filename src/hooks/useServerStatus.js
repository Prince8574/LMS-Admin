import { useState, useEffect, useRef } from 'react';

const MAX_HISTORY = 20; // last 20 checks

export function useServerStatus(url, interval = 30000) {
  const [status, setStatus] = useState({
    label: 'Checking...',
    color: '#f59e0b',
    dot: '#f59e0b',
    detail: null,
    latency: null,
    lastCheck: null,
    history: [], // [{ time, latency, ok, label }]
    uptime: null, // percentage
  });

  const historyRef = useRef([]);

  useEffect(() => {
    const check = async () => {
      const start = Date.now();
      const time = new Date().toLocaleTimeString();
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        const latency = Date.now() - start;
        const data = await res.json();
        const ok = res.ok && (data.status === 'OK' || data.status === 'ok');

        const entry = { time, latency, ok, label: ok ? 'Operational' : 'Offline' };
        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), entry];

        const uptime = Math.round(
          (historyRef.current.filter(h => h.ok).length / historyRef.current.length) * 100
        );

        setStatus({
          label: ok ? 'Operational' : 'Offline',
          color: ok ? '#4ade80' : '#ef4444',
          dot: ok ? '#4ade80' : '#ef4444',
          detail: ok ? `DB: ${data.db || 'connected'} · ${latency}ms` : 'Server responded with error',
          latency,
          lastCheck: time,
          history: [...historyRef.current],
          uptime,
        });
      } catch (err) {
        const entry = { time, latency: null, ok: false, label: 'Offline' };
        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), entry];

        const uptime = historyRef.current.length > 0
          ? Math.round((historyRef.current.filter(h => h.ok).length / historyRef.current.length) * 100)
          : 0;

        setStatus({
          label: 'Offline',
          color: '#ef4444',
          dot: '#ef4444',
          detail: `Cannot reach server — ${err.message}`,
          latency: null,
          lastCheck: time,
          history: [...historyRef.current],
          uptime,
        });
      }
    };

    check();
    const id = setInterval(check, interval);
    return () => clearInterval(id);
  }, [url, interval]);

  return status;
}
