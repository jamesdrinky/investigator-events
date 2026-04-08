'use client';

import { useState, useRef, useEffect } from 'react';

export function ExpandableText({ text, maxLines = 4, className = '', accentColor }: { text: string; maxLines?: number; className?: string; accentColor?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Check on mobile-like widths — on desktop, show full text
    const check = () => {
      if (!ref.current) return;
      // Temporarily apply clamp to measure
      ref.current.style.display = '-webkit-box';
      ref.current.style.webkitLineClamp = String(maxLines);
      ref.current.style.webkitBoxOrient = 'vertical';
      ref.current.style.overflow = 'hidden';
      const clamped = ref.current.scrollHeight > ref.current.clientHeight + 2;
      // Restore
      if (expanded || window.innerWidth >= 1024) {
        ref.current.style.display = '';
        ref.current.style.webkitLineClamp = '';
        ref.current.style.webkitBoxOrient = '';
        ref.current.style.overflow = '';
      }
      setNeedsExpand(clamped && window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [text, maxLines, expanded]);

  const clampStyle = (!expanded && needsExpand)
    ? { display: '-webkit-box', WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }
    : {};

  return (
    <div>
      <div
        ref={ref}
        className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-600 transition-all duration-300 ${className}`}
        style={clampStyle}
      >
        {text}
      </div>
      {needsExpand && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 text-sm font-semibold transition"
          style={{ color: accentColor ?? '#64748b' }}
        >
          {expanded ? '...show less' : '...see more'}
        </button>
      )}
    </div>
  );
}
