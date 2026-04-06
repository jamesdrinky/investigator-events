'use client';

import React from 'react';

interface GlowCardProps {
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  children?: React.ReactNode;
}

export function GlowCard({ title, description, gradientFrom, gradientTo, children }: GlowCardProps) {
  return (
    <div className="group relative w-full transition-all duration-500">
      {/* Skewed gradient panel */}
      <span
        className="absolute inset-y-0 left-[30px] w-[55%] rounded-2xl opacity-60 blur-[20px] transition-all duration-500 group-hover:left-[10px] group-hover:w-[calc(100%-40px)] group-hover:opacity-80 sm:left-[40px] sm:skew-x-[12deg] sm:blur-[25px] sm:group-hover:left-[16px] sm:group-hover:skew-x-0"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {/* Card content */}
      <div className="relative z-10 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.06)] p-7 backdrop-blur-md transition-all duration-500 group-hover:bg-[rgba(255,255,255,0.09)] sm:p-8">
        {children}
        <h3 className="text-[1.3rem] font-semibold leading-tight text-white sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-[1.6] text-white/60 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
