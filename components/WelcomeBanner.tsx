'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const LOGOS = [
  'abi.png', 'wad.png', 'ikd.png', 'cii.png', 'intellenet.png', 'federpol.png',
  'budeg.png', 'eurodet.png', 'fapi.png', 'nciss.png', 'tali.png', 'fali.png',
];

export function WelcomeBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 600;
    const h = 240;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    let frame = 0;
    let animId: number;

    const draw = () => {
      frame++;
      const t = frame * 0.008;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Animated dots/particles
      for (let i = 0; i < 40; i++) {
        const x = ((i * 97 + frame * 0.3) % (w + 40)) - 20;
        const y = ((i * 73 + Math.sin(t + i) * 20) % h);
        const size = 1 + Math.sin(t * 2 + i) * 0.5;
        const alpha = 0.1 + Math.sin(t + i * 0.5) * 0.08;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.fill();
      }

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }

      // Glowing orb
      const orbX = w * 0.5 + Math.sin(t * 0.7) * 80;
      const orbY = h * 0.5 + Math.cos(t * 0.5) * 30;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 120);
      orbGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      orbGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
      orbGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrad;
      ctx.fillRect(0, 0, w, h);

      // Second orb
      const orb2X = w * 0.3 + Math.cos(t * 0.4) * 60;
      const orb2Y = h * 0.4 + Math.sin(t * 0.6) * 25;
      const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 100);
      orb2Grad.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
      orb2Grad.addColorStop(1, 'transparent');
      ctx.fillStyle = orb2Grad;
      ctx.fillRect(0, 0, w, h);

      // Text
      ctx.textAlign = 'center';

      // "INVESTIGATOR EVENTS" small
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillStyle = 'rgba(147, 197, 253, 0.7)';
      ctx.fillText('I N V E S T I G A T O R   E V E N T S', w / 2, h * 0.32);

      // "Welcome" large
      ctx.font = '700 42px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText('Welcome', w / 2, h * 0.56);

      // Subtitle
      ctx.font = '400 14px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.fillText('Connect with investigators worldwide', w / 2, h * 0.72);

      // Bottom line accent
      const lineWidth = 80 + Math.sin(t) * 20;
      const lineGrad = ctx.createLinearGradient(w / 2 - lineWidth, 0, w / 2 + lineWidth, 0);
      lineGrad.addColorStop(0, 'transparent');
      lineGrad.addColorStop(0.3, 'rgba(59, 130, 246, 0.6)');
      lineGrad.addColorStop(0.7, 'rgba(139, 92, 246, 0.6)');
      lineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 - lineWidth, h * 0.82);
      ctx.lineTo(w / 2 + lineWidth, h * 0.82);
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ aspectRatio: '600/240', maxWidth: '100%', height: 'auto' }}
      />
      {/* Logo strip overlay at bottom */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
        {LOGOS.slice(0, 8).map((logo) => (
          <div key={logo} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm sm:h-7 sm:w-7">
            <Image src={`/associations/${logo}`} alt="" width={18} height={18} className="h-3.5 w-3.5 object-contain opacity-60 sm:h-4 sm:w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
