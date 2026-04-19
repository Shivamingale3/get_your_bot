'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useBackendHealth() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, {
          method: 'GET',
          cache: 'no-store',
        });
        if (res.ok) {
          setIsBackendReady(true);
          setIsChecking(false);
          clearInterval(intervalId);
        }
      } catch {
        // Backend not ready yet
      }
    };

    checkHealth();
    intervalId = setInterval(checkHealth, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return { isBackendReady, isChecking };
}

export default function BackendLoader({ children }: { children: React.ReactNode }) {
  const { isBackendReady, isChecking } = useBackendHealth();

  if (!isBackendReady && isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-30 animate-pulse" style={{ background: 'var(--accent)' }} />
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center animate-spin" style={{ background: 'var(--accent)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Warming up the backend
          </h2>
          <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
            First-time setup takes about 30 seconds...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
