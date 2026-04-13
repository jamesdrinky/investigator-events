'use client';

import { useState } from 'react';

type Props = {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: number;
  className?: string;
  color?: string;
};

export function UserAvatar({ src, name, size = 32, className = '', color }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = (name ?? 'U').charAt(0).toUpperCase();
  const bg = color ? `${color}15` : '#dbeafe';
  const fg = color ?? '#2563eb';

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full ${className}`}
        style={{ width: size, height: size, backgroundColor: bg, color: fg, fontSize: size * 0.4, fontWeight: 700 }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? ''}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size, maxWidth: '100%', maxHeight: '100%' }}
      onError={() => setFailed(true)}
    />
  );
}
