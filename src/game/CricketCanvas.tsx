/**
 * Cricket Hit Master - High-Performance 60FPS Cricket Canvas & Physics Engine
 * Renders the 3D-perspective pitch, bowler animation, ball trajectory, batsman swing,
 * stump physics, particles, and shot effects.
 */

import React, { useEffect, useRef } from 'react';
import { BowlerProfile, ShotOutcome, ShotResult, TimingRating } from '../types/game';

interface CricketCanvasProps {
  isBowling: boolean;
  bowler: BowlerProfile;
  ballProgress: number; // 0 (bowler hand) to 1 (crease)
  onHitAttempt: () => void;
  lastHitResult: ShotResult | null;
  isHitActive: boolean;
  isOut: boolean;
  shakeScreen: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  decay: number;
  shape?: 'circle' | 'rect' | 'spark';
}

interface BailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  width: number;
  height: number;
  color: string;
  alpha: number;
}

export const CricketCanvas: React.FC<CricketCanvasProps> = ({
  isBowling,
  bowler,
  ballProgress,
  onHitAttempt,
  lastHitResult,
  isHitActive,
  isOut,
  shakeScreen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation states
  const batsmanSwingRef = useRef<number>(0); // 0 (stance) to 1 (full swing)
  const batsmanSwingTypeRef = useRef<ShotOutcome | 'MISS'>('FOUR');
  const ballFlightRef = useRef<{
    active: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    scale: number;
    type: ShotOutcome;
    progress: number;
  }>({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    scale: 1,
    type: 'FOUR',
    progress: 0,
  });

  const bailsFlyingRef = useRef<BailParticle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<{ x: number; y: number; alpha: number; scale: number }[]>([]);
  const pitchBouncePuffRef = useRef<boolean>(false);

  // Trigger bat swing on hit
  useEffect(() => {
    if (isHitActive && lastHitResult) {
      batsmanSwingRef.current = 1.0;
      batsmanSwingTypeRef.current = lastHitResult.outcome;

      // Ball launch physics based on outcome
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const batsmanX = w * 0.5;
      const batsmanY = h * 0.72;

      if (lastHitResult.outcome === 'SIX') {
        ballFlightRef.current = {
          active: true,
          x: batsmanX,
          y: batsmanY,
          vx: (Math.random() - 0.5) * 4,
          vy: -14,
          scale: 1.2,
          type: 'SIX',
          progress: 0,
        };
        // Spawn sparks
        for (let i = 0; i < 24; i++) {
          particlesRef.current.push({
            x: batsmanX,
            y: batsmanY - 10,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.7) * 12,
            radius: Math.random() * 3 + 1.5,
            color: Math.random() > 0.4 ? '#fbbf24' : '#f59e0b',
            alpha: 1,
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            shape: 'spark',
          });
        }
      } else if (lastHitResult.outcome === 'FOUR') {
        const dir = Math.random() > 0.5 ? 1 : -1;
        ballFlightRef.current = {
          active: true,
          x: batsmanX,
          y: batsmanY,
          vx: dir * (7 + Math.random() * 3),
          vy: -5 - Math.random() * 3,
          scale: 1.0,
          type: 'FOUR',
          progress: 0,
        };
        for (let i = 0; i < 16; i++) {
          particlesRef.current.push({
            x: batsmanX,
            y: batsmanY,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 6,
            radius: Math.random() * 2 + 1,
            color: '#10b981',
            alpha: 1,
            life: 1,
            decay: 0.03,
            shape: 'spark',
          });
        }
      } else if (lastHitResult.outcome === 'ONE' || lastHitResult.outcome === 'TWO') {
        const dir = Math.random() > 0.5 ? 0.7 : -0.7;
        ballFlightRef.current = {
          active: true,
          x: batsmanX,
          y: batsmanY,
          vx: dir * 3.5,
          vy: -3.5,
          scale: 0.8,
          type: lastHitResult.outcome,
          progress: 0,
        };
      }
    }
  }, [isHitActive, lastHitResult]);

  // Trigger wicket dislodging
  useEffect(() => {
    if (isOut) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const stumpX = w * 0.48;
      const stumpY = h * 0.74;

      // Dislodge bails and stumps
      bailsFlyingRef.current = [
        {
          x: stumpX - 6,
          y: stumpY - 26,
          vx: -4 + Math.random() * 2,
          vy: -8 - Math.random() * 3,
          rotation: 0,
          vRot: 0.3,
          width: 14,
          height: 3,
          color: '#fbbf24',
          alpha: 1,
        },
        {
          x: stumpX + 6,
          y: stumpY - 26,
          vx: 4 + Math.random() * 2,
          vy: -9 - Math.random() * 3,
          rotation: 0,
          vRot: -0.4,
          width: 14,
          height: 3,
          color: '#fbbf24',
          alpha: 1,
        },
        // Flying middle stump
        {
          x: stumpX,
          y: stumpY - 14,
          vx: (Math.random() - 0.3) * 5,
          vy: -6 - Math.random() * 4,
          rotation: 0,
          vRot: 0.25,
          width: 4,
          height: 24,
          color: '#fef08a',
          alpha: 1,
        },
      ];

      // Red flash particles
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          x: stumpX + (Math.random() - 0.5) * 20,
          y: stumpY - 10 + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.6) * 8,
          radius: Math.random() * 3 + 1,
          color: '#ef4444',
          alpha: 1,
          life: 1,
          decay: 0.025,
          shape: 'circle',
        });
      }
    }
  }, [isOut]);

  // Reset ball flight when new ball begins
  useEffect(() => {
    if (isBowling && ballProgress < 0.05) {
      ballFlightRef.current.active = false;
      bailsFlyingRef.current = [];
      pitchBouncePuffRef.current = false;
      batsmanSwingRef.current = 0;
      trailRef.current = [];
    }
  }, [isBowling, ballProgress]);

  // Main Render Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp canvas
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const w = canvas.clientWidth || 360;
      const h = canvas.clientHeight || 500;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Stadium Sky & Floodlights
      drawStadium(ctx, w, h);

      // 2. Draw Pitch & Creases with 3D perspective
      drawPitch(ctx, w, h);

      // 3. Draw Bowler at Non-Striker end
      drawBowler(ctx, w, h, isBowling, ballProgress, bowler);

      // 4. Draw Stumps & Batsman at Striker end
      drawStrikerWickets(ctx, w, h, isOut);
      drawBatsman(ctx, w, h, batsmanSwingRef.current, batsmanSwingTypeRef.current);

      // 5. Draw Delivery Ball & Shadow (if bowling and not yet hit)
      if (isBowling && !ballFlightRef.current.active && !isOut) {
        drawDeliveryBall(ctx, w, h, ballProgress, bowler);
      }

      // 6. Draw Batted Ball Flight
      if (ballFlightRef.current.active) {
        drawBattedBall(ctx, w, h);
      }

      // 7. Draw Flying Bails (on wicket)
      drawFlyingBails(ctx);

      // 8. Update & Draw Particles (dust, sparks, confetti)
      drawParticles(ctx);

      // Decay batsman swing back to ready stance smoothly
      if (batsmanSwingRef.current > 0 && !isHitActive) {
        batsmanSwingRef.current = Math.max(0, batsmanSwingRef.current - 0.035);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isBowling, ballProgress, bowler, isHitActive, isOut]);

  // Helper Drawing Functions
  const drawStadium = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Atmospheric dark night stadium gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.38);
    skyGrad.addColorStop(0, '#060d19');
    skyGrad.addColorStop(0.65, '#0b192e');
    skyGrad.addColorStop(1, '#0e233d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.38);

    // Floodlight beams
    const drawFloodlight = (x: number, angle: number) => {
      ctx.save();
      ctx.translate(x, 18);
      // Floodlight tower pole
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 35);
      ctx.stroke();

      // Light bank
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-10, -5, 20, 7);

      // Light glow cones
      const beamGrad = ctx.createRadialGradient(0, 0, 2, 0, 100, 160);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      beamGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.18)');
      beamGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(angle > 0 ? 90 : -90, 180);
      ctx.lineTo(angle > 0 ? 10 : -10, 180);
      ctx.closePath();
      ctx.fill();

      // Bulbs
      ctx.fillStyle = '#ffffff';
      for (let b = -7; b <= 7; b += 4) {
        ctx.beginPath();
        ctx.arc(b, -2, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    drawFloodlight(w * 0.12, 1);
    drawFloodlight(w * 0.88, -1);

    // Stadium Crowd Stands (multi-tiered crowd silhouette with flashbulbs)
    const standY = h * 0.22;
    ctx.fillStyle = '#091526';
    ctx.fillRect(0, standY, w, h * 0.12);

    // Subtle crowd dots (people textures)
    ctx.fillStyle = '#1e293b';
    for (let i = 8; i < w; i += 11) {
      const dotY = standY + 6 + (Math.sin(i * 0.5) * 5);
      ctx.fillRect(i, dotY, 4, 6);
    }
    // Rare camera flashes in stands
    if (Math.random() < 0.1) {
      const flashX = Math.random() * w;
      const flashY = standY + Math.random() * 20;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(flashX, flashY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boundary Board & Advertising cushions
    const boundY = h * 0.32;
    const boundGrad = ctx.createLinearGradient(0, boundY, 0, boundY + 12);
    boundGrad.addColorStop(0, '#1e293b');
    boundGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = boundGrad;
    ctx.fillRect(0, boundY, w, 10);

    // Boundary White Ribbon Line
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, boundY + 10);
    ctx.lineTo(w, boundY + 10);
    ctx.stroke();
  };

  const drawPitch = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const horizonY = h * 0.33;

    // Outfield Grass with realistic mowing stripe patterns
    const grassTopY = horizonY;
    const grassGrad = ctx.createLinearGradient(0, grassTopY, 0, h);
    grassGrad.addColorStop(0, '#155e34');
    grassGrad.addColorStop(0.4, '#166534');
    grassGrad.addColorStop(1, '#0f4826');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, grassTopY, w, h - grassTopY);

    // Mowing stripes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    for (let x = -w * 0.2; x < w * 1.2; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x + 18, grassTopY);
      ctx.lineTo(x + 36, grassTopY);
      ctx.lineTo(x + 54, h);
      ctx.lineTo(x + 36, h);
      ctx.closePath();
      ctx.fill();
    }

    // 22-Yard Cricket Pitch (Perspective trapezoid)
    // Non-striker end (narrow top), Striker end (wide bottom)
    const pitchTopW = w * 0.22;
    const pitchBottomW = w * 0.58;
    const pitchTopX = (w - pitchTopW) / 2;
    const pitchBottomX = (w - pitchBottomW) / 2;
    const pitchTopY = horizonY + 8;
    const pitchBottomY = h * 0.88;

    // Pitch Clay / Turf surface
    const pitchGrad = ctx.createLinearGradient(0, pitchTopY, 0, pitchBottomY);
    pitchGrad.addColorStop(0, '#b49a6c');
    pitchGrad.addColorStop(0.3, '#c2aa79');
    pitchGrad.addColorStop(0.7, '#baa070');
    pitchGrad.addColorStop(1, '#ab8e5c');

    ctx.fillStyle = pitchGrad;
    ctx.beginPath();
    ctx.moveTo(pitchTopX, pitchTopY);
    ctx.lineTo(pitchTopX + pitchTopW, pitchTopY);
    ctx.lineTo(pitchBottomX + pitchBottomW, pitchBottomY);
    ctx.lineTo(pitchBottomX, pitchBottomY);
    ctx.closePath();
    ctx.fill();

    // Pitch turf wear lines / footmarks
    ctx.strokeStyle = 'rgba(120, 90, 50, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const yPos = pitchTopY + (pitchBottomY - pitchTopY) * (0.3 + i * 0.18);
      const spanW = pitchTopW + (pitchBottomW - pitchTopW) * (0.3 + i * 0.18);
      ctx.beginPath();
      ctx.moveTo(w * 0.5 - spanW * 0.25, yPos);
      ctx.lineTo(w * 0.5 + spanW * 0.25, yPos);
      ctx.stroke();
    }

    // White Crease Markings (Popping Crease & Return Creases)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;

    // Non-striker bowling crease
    const nsY = pitchTopY + 14;
    const nsW = pitchTopW * 1.1;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - nsW / 2, nsY);
    ctx.lineTo(w * 0.5 + nsW / 2, nsY);
    ctx.stroke();

    // Striker popping crease (where batsman stands)
    const strikerCreaseY = h * 0.74;
    const creaseW = pitchBottomW * 0.95;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - creaseW / 2, strikerCreaseY);
    ctx.lineTo(w * 0.5 + creaseW / 2, strikerCreaseY);
    ctx.stroke();

    // Striker bowling crease line (behind popping crease)
    const backCreaseY = h * 0.77;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - creaseW * 0.45, backCreaseY);
    ctx.lineTo(w * 0.5 + creaseW * 0.45, backCreaseY);
    ctx.stroke();

    // Return creases (side borders at striker end)
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - creaseW * 0.45, strikerCreaseY - 8);
    ctx.lineTo(w * 0.5 - creaseW * 0.45, backCreaseY + 6);
    ctx.moveTo(w * 0.5 + creaseW * 0.45, strikerCreaseY - 8);
    ctx.lineTo(w * 0.5 + creaseW * 0.45, backCreaseY + 6);
    ctx.stroke();

    // Non-striker Wickets (small in distance)
    ctx.fillStyle = '#fef08a';
    for (let st = -3; st <= 3; st += 3) {
      ctx.fillRect(w * 0.5 + st - 0.7, nsY - 8, 1.4, 8);
    }
  };

  const drawBowler = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    isBowlingActive: boolean,
    progress: number,
    bowlerProfile: BowlerProfile
  ) => {
    const horizonY = h * 0.33;
    const bowlerBaseX = w * 0.5;
    const bowlerBaseY = horizonY + 12;

    // Bowler Run-up position animation
    // When bowling starts, bowler runs up toward bowling crease
    let runOffset = 0;
    let armAngle = 0;
    let legOffset = 0;

    if (isBowlingActive) {
      // Windup in first 15% of delivery, release at 15%, follow-through after
      if (progress < 0.18) {
        const windProgress = progress / 0.18;
        runOffset = (1 - windProgress) * 14;
        armAngle = windProgress * Math.PI * 2;
        legOffset = Math.sin(windProgress * Math.PI * 6) * 4;
      } else {
        armAngle = Math.PI * 1.6;
        runOffset = 0;
        legOffset = 2;
      }
    } else {
      // Idle bounce
      legOffset = Math.sin(Date.now() * 0.005) * 1.5;
    }

    ctx.save();
    ctx.translate(bowlerBaseX, bowlerBaseY - runOffset);

    // Bowler shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bowler legs (white cricket trousers)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-3, 0, 2.5, 6 + legOffset);
    ctx.fillRect(0.5, 0, 2.5, 6 - legOffset);

    // Bowler torso (team jersey)
    ctx.fillStyle = bowlerProfile.id % 2 === 0 ? '#1e40af' : '#b91c1c';
    ctx.fillRect(-4, -8, 8, 8);

    // Bowler head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, -11, 3, 0, Math.PI * 2);
    ctx.fill();

    // Bowler cap
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -12, 3.2, Math.PI, Math.PI * 2);
    ctx.fill();

    // Bowling arm rotating
    ctx.save();
    ctx.translate(3, -7);
    ctx.rotate(armAngle);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-1.2, 0, 2.4, 7);
    // Ball in hand before release
    if (isBowlingActive && progress < 0.15) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 7, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  };

  const drawStrikerWickets = (ctx: CanvasRenderingContext2D, w: number, h: number, out: boolean) => {
    if (out) return; // Dislodged bails will handle drawing in drawFlyingBails

    const stumpX = w * 0.48;
    const stumpY = h * 0.74;

    // Stumps shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(stumpX, stumpY + 2, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Three wooden stumps
    ctx.fillStyle = '#eab308';
    const spacing = 7;
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(stumpX + i * spacing - 1.8, stumpY - 26, 3.6, 28);
      // Stump crown tips
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(stumpX + i * spacing - 1.8, stumpY - 28, 3.6, 2);
      ctx.fillStyle = '#eab308';
    }

    // Two bails resting on top
    ctx.fillStyle = '#fde047';
    ctx.fillRect(stumpX - 8, stumpY - 29.5, 7.5, 2.2);
    ctx.fillRect(stumpX + 0.5, stumpY - 29.5, 7.5, 2.2);
  };

  const drawBatsman = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    swing: number, // 0 = stance, 1 = full swing
    shotType: ShotOutcome | 'MISS'
  ) => {
    // Batsman stands slightly to leg side of the stumps
    const batsmanBaseX = w * 0.57;
    const batsmanBaseY = h * 0.74;

    ctx.save();
    ctx.translate(batsmanBaseX, batsmanBaseY);

    // Batsman stance idle breathing animation
    const idleY = swing === 0 ? Math.sin(Date.now() * 0.006) * 1.5 : 0;

    // Batsman ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(-4, 3, 16 + swing * 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs with batting pads (white & embossed straps)
    ctx.fillStyle = '#e2e8f0';
    // Back leg
    ctx.fillRect(-12, -26 + idleY, 8, 28);
    // Front leg (steps slightly forward on swing)
    const stepX = swing * -6;
    ctx.fillRect(-3 + stepX, -28 + idleY, 8, 30);

    // Colored pad trim
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-12, -18 + idleY, 8, 3);
    ctx.fillRect(-3 + stepX, -20 + idleY, 8, 3);

    // Torso / Jersey (Cricket Hit Master Navy & Gold Jersey)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-14 + stepX * 0.5, -50 + idleY, 16, 24, 4);
    ctx.fill();

    // Gold jersey accents
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-14 + stepX * 0.5, -42 + idleY, 16, 3);

    // Helmet & Grill
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(-6 + stepX * 0.5, -56 + idleY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Helmet peak
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.moveTo(-13 + stepX * 0.5, -55 + idleY);
    ctx.lineTo(-6 + stepX * 0.5, -58 + idleY);
    ctx.lineTo(-6 + stepX * 0.5, -54 + idleY);
    ctx.closePath();
    ctx.fill();

    // Helmet steel face grill
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-11 + stepX * 0.5, -54 + idleY);
    ctx.lineTo(-4 + stepX * 0.5, -51 + idleY);
    ctx.stroke();

    // Batsman Arms & Bat (Rotating with swing)
    ctx.save();
    // Pivot at batsman shoulders
    ctx.translate(-8 + stepX * 0.5, -45 + idleY);

    // Swing angle calculation
    let batAngle = 0.5; // Stance backlift angle
    if (swing > 0) {
      if (shotType === 'SIX') {
        // High lofted follow-through swing
        batAngle = 0.5 - swing * 2.6;
      } else if (shotType === 'FOUR') {
        // Crisp drive horizontal sweep
        batAngle = 0.5 - swing * 2.2;
      } else {
        // Push / defensive block
        batAngle = 0.5 - swing * 1.2;
      }
    }

    ctx.rotate(batAngle);

    // Batsman hands with batting gloves
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.arc(0, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Cricket Bat Handle (Cane & rubber grip)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-1.5, 0, 3, 14);

    // Bat Blade (English Willow wood with red/gold stickers)
    const bladeGrad = ctx.createLinearGradient(0, 14, 0, 44);
    bladeGrad.addColorStop(0, '#fef3c7');
    bladeGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = bladeGrad;
    ctx.fillRect(-4, 14, 8, 30);

    // Bat profile curve
    ctx.beginPath();
    ctx.arc(0, 44, 4, 0, Math.PI);
    ctx.fill();

    // Bat sponsor sticker
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-3, 20, 6, 8);

    ctx.restore(); // Restore bat pivot

    ctx.restore(); // Restore batsman position
  };

  const drawDeliveryBall = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    progress: number,
    bowlerProfile: BowlerProfile
  ) => {
    if (progress < 0.12) return; // Still in bowler's hand

    // Normalised delivery progress from 0.12 (release) to 1.0 (crease)
    const deliveryP = (progress - 0.12) / 0.88;

    const startX = w * 0.5 + (bowlerProfile.releaseVariation ? (bowlerProfile.id % 2 === 0 ? 6 : -6) : 0);
    const startY = h * 0.33 + 12;

    const targetX = w * 0.5;
    const targetY = h * 0.74;

    // Pitch bounce typically at ~60% of trajectory
    const bounceP = 0.62;

    // Lateral movement:
    // In-swing / out-swing gradually curves the ball in the air
    const swingOffset = Math.sin(deliveryP * Math.PI) * bowlerProfile.swingAmount * 35;
    // Spin takes sharp turn only AFTER bounce
    const spinOffset = deliveryP > bounceP ? (deliveryP - bounceP) * bowlerProfile.spinAmount * 60 : 0;

    const currentX = startX + (targetX - startX) * deliveryP + swingOffset + spinOffset;

    // Height calculation: parabolic arc to pitch, then bounce arc to batsman
    let currentY: number;
    let shadowY: number;

    const pitchGroundY = startY + (targetY - startY) * deliveryP;
    shadowY = pitchGroundY;

    if (deliveryP < bounceP) {
      // First arc from bowler release to pitch bounce
      const arcP = deliveryP / bounceP;
      // Ball descends towards the pitch
      const arcHeight = Math.sin(arcP * Math.PI) * 16 * bowlerProfile.bounceHeight;
      currentY = startY + (targetY - startY) * deliveryP - (1 - arcP) * 22 - arcHeight;
    } else {
      // Post-bounce puff of grass/dust triggered once
      if (!pitchBouncePuffRef.current) {
        pitchBouncePuffRef.current = true;
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push({
            x: currentX + (Math.random() - 0.5) * 6,
            y: shadowY,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3,
            radius: Math.random() * 2 + 1,
            color: '#d97706',
            alpha: 0.8,
            life: 1,
            decay: 0.05,
            shape: 'circle',
          });
        }
      }

      // Second arc bouncing up towards batsman
      const arcP = (deliveryP - bounceP) / (1 - bounceP);
      const bounceApex = 32 * bowlerProfile.bounceHeight;
      const bounceHeight = Math.sin(arcP * Math.PI * 0.85) * bounceApex;
      currentY = pitchGroundY - bounceHeight;
    }

    // Perspective scaling: radius grows as it nears batsman
    const ballRadius = 3 + deliveryP * 8.5;

    // Ball Ground Shadow
    const shadowAlpha = Math.max(0.1, 0.45 - (pitchGroundY - currentY) * 0.008);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(currentX, shadowY, ballRadius * 1.1, ballRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Speed Trail for fast balls (> 125 km/h)
    if (bowlerProfile.speedKmh > 120 && deliveryP > 0.25) {
      trailRef.current.push({ x: currentX, y: currentY, alpha: 0.5, scale: ballRadius });
      if (trailRef.current.length > 5) trailRef.current.shift();

      trailRef.current.forEach((t) => {
        ctx.fillStyle = `rgba(239, 68, 68, ${t.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.scale * 0.8, 0, Math.PI * 2);
        ctx.fill();
        t.alpha -= 0.08;
      });
    }

    // Red Leather Cricket Ball
    const ballGrad = ctx.createRadialGradient(
      currentX - ballRadius * 0.35,
      currentY - ballRadius * 0.35,
      ballRadius * 0.1,
      currentX,
      currentY,
      ballRadius
    );
    ballGrad.addColorStop(0, '#f87171');
    ballGrad.addColorStop(0.3, '#dc2626');
    ballGrad.addColorStop(0.85, '#991b1b');
    ballGrad.addColorStop(1, '#450a0a');

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(currentX, currentY, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // White Prominent Cricket Seam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = Math.max(1, ballRadius * 0.18);
    ctx.beginPath();
    ctx.ellipse(currentX, currentY, ballRadius * 0.9, ballRadius * 0.25, Math.PI * 0.35 + deliveryP * 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawBattedBall = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const flight = ballFlightRef.current;
    if (!flight.active) return;

    flight.x += flight.vx;
    flight.y += flight.vy;
    flight.progress += 0.02;

    if (flight.type === 'SIX') {
      flight.vy += 0.28; // Gravity pulling it down into crowd
      flight.scale = Math.max(0.4, flight.scale - 0.008); // Shrinks as it goes into distance

      // Golden comet trail
      particlesRef.current.push({
        x: flight.x,
        y: flight.y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: flight.scale * 4,
        color: '#f59e0b',
        alpha: 0.7,
        life: 1,
        decay: 0.04,
        shape: 'spark',
      });
    } else if (flight.type === 'FOUR') {
      flight.vy += 0.15;
      flight.scale = Math.max(0.6, flight.scale - 0.005);

      // Grass turf tracer
      particlesRef.current.push({
        x: flight.x,
        y: flight.y + 4,
        vx: 0,
        vy: 0,
        radius: 2,
        color: '#10b981',
        alpha: 0.6,
        life: 1,
        decay: 0.05,
        shape: 'circle',
      });
    } else {
      // 1 or 2 runs roll
      flight.vx *= 0.96;
      flight.vy *= 0.96;
    }

    // Draw ball
    const r = Math.max(3, 10 * flight.scale);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(flight.x, flight.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Seam
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(flight.x, flight.y, r * 0.8, 0, Math.PI);
    ctx.stroke();

    // Deactivate when offscreen
    if (flight.y < -20 || flight.x < -40 || flight.x > w + 40 || flight.progress > 1.8) {
      flight.active = false;
    }
  };

  const drawFlyingBails = (ctx: CanvasRenderingContext2D) => {
    bailsFlyingRef.current.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.45; // Gravity
      b.rotation += b.vRot;
      b.alpha = Math.max(0, b.alpha - 0.012);

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
      ctx.restore();
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={onHitAttempt}
      onTouchStart={(e) => {
        e.preventDefault();
        onHitAttempt();
      }}
      className={`relative w-full h-full cursor-pointer select-none overflow-hidden touch-none ${
        shakeScreen ? 'animate-shake' : ''
      }`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
