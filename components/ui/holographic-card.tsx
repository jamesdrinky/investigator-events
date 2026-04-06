'use client';

import { useRef, type ReactNode, type HTMLAttributes } from 'react';

interface HolographicCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Disable the 3D tilt + holo effect (static card) */
  disabled?: boolean;
}

export function HolographicCard({
  children,
  className = '',
  disabled = false,
  ...props
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 6;
    const rotateY = ((centerX - x) / centerX) * 6;

    card.style.setProperty('--holo-x', `${x}px`);
    card.style.setProperty('--holo-y', `${y}px`);
    card.style.setProperty('--holo-bg-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--holo-bg-y', `${(y / rect.height) * 100}%`);
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (disabled || !cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = '';
    card.style.setProperty('--holo-bg-x', '50%');
    card.style.setProperty('--holo-bg-y', '50%');
  };

  return (
    <div
      ref={cardRef}
      className={`holo-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      <div className="holo-shine" />
    </div>
  );
}
