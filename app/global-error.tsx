'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Something went wrong</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>An unexpected error occurred. Our team has been notified.</p>
            {error.message && (
              <details style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error details</summary>
                <p style={{ marginTop: '0.5rem', fontFamily: 'ui-monospace,monospace', wordBreak: 'break-word' }}>{error.message}</p>
                {error.digest && <p style={{ marginTop: '0.25rem', color: '#94a3b8' }}>digest: {error.digest}</p>}
              </details>
            )}
            <button
              onClick={reset}
              style={{ padding: '0.75rem 2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
