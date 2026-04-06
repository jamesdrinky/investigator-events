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
      {/* Skewed gradient glow behind card */}
      <span
        className="absolute inset-y-0 left-[30px] w-[55%] rounded-2xl skew-x-[12deg] opacity-50 blur-[22px] transition-all duration-500 group-hover:left-[12px] group-hover:w-[calc(100%-40px)] group-hover:skew-x-0 group-hover:opacity-75"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      {/* Secondary deeper blur for richness */}
      <span
        className="absolute inset-y-0 left-[30px] w-[55%] rounded-2xl skew-x-[12deg] opacity-30 blur-[50px] transition-all duration-500 group-hover:left-[12px] group-hover:w-[calc(100%-40px)] group-hover:skew-x-0 group-hover:opacity-50"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {/* Card content */}
      <div className="relative z-10 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-7 backdrop-blur-md transition-all duration-500 group-hover:border-white/[0.14] group-hover:bg-[rgba(255,255,255,0.08)] sm:p-8 lg:p-9">
        {children}
        <h3 className="text-[1.3rem] font-semibold leading-tight text-white sm:text-[1.5rem] lg:text-2xl">
          {title}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-[1.65] text-white/50 sm:mt-4 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
