import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- Layer 1: Pure Canvas Neural Network Swarm ---
const NetworkCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    // Reduce density slightly to make it less chaotic
    const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 20000);
    const connectionDistance = 150;
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      
      constructor() {
        this.x = canvas ? Math.random() * canvas.width : 0;
        this.y = canvas ? Math.random() * canvas.height : 0;
        // SIGNIFICANTLY REDUCED SPEED for a calm, premium feel
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (!canvas) return;
        // Bounce off walls smoothly
        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;
      }

      draw() {
        if (!canvas || !ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.5)'; // sky-500
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Check connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Opacity fades as distance increases
            const opacity = 1 - distance / connectionDistance;
            ctx.strokeStyle = `rgba(14, 165, 233, ${opacity * 0.3})`; // Softer lines
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// --- Layer 2: Framer Motion SVG Circuit Paths ---
const SvgCircuits = () => {
  const draw: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.6,
      transition: {
        pathLength: { duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
        opacity: { duration: 0.5 }
      }
    }
  };

  const drawSlow: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.4,
      transition: {
        pathLength: { duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
        opacity: { duration: 1 }
      }
    }
  };

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-multiply">
      {/* Top Left Circuit */}
      <svg className="absolute top-0 left-0 w-80 h-80" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
        <motion.path
          d="M 0 10 L 30 10 L 40 20 L 70 20 L 80 10 L 100 10"
          stroke="#0284c7" // sky-600
          strokeWidth="0.5"
          variants={draw}
          initial="hidden"
          animate="visible"
        />
        <motion.path
          d="M 0 25 L 20 25 L 35 40 L 50 40 L 60 50 L 100 50"
          stroke="#4f46e5" // indigo-600
          strokeWidth="0.8"
          variants={drawSlow}
          initial="hidden"
          animate="visible"
        />
        <circle cx="40" cy="20" r="1.5" fill="#0284c7" className="opacity-40 animate-pulse" />
        <circle cx="60" cy="50" r="2" fill="#4f46e5" className="opacity-40 animate-pulse" />
      </svg>
      
      {/* Bottom Right Circuit */}
      <svg className="absolute bottom-0 right-0 w-96 h-96 transform rotate-180" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
        <motion.path
          d="M 0 15 L 40 15 L 55 30 L 75 30 L 85 20 L 100 20"
          stroke="#0ea5e9" // sky-500
          strokeWidth="0.6"
          variants={draw}
          initial="hidden"
          animate="visible"
        />
        <motion.path
          d="M 0 45 L 30 45 L 45 30 L 80 30 L 90 20 L 100 20"
          stroke="#7c3aed" // violet-600
          strokeWidth="1"
          variants={drawSlow}
          initial="hidden"
          animate="visible"
        />
        <circle cx="55" cy="30" r="1.5" fill="#0ea5e9" className="opacity-40 animate-pulse" />
      </svg>
    </div>
  );
};

export const TechSwarmBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-slate-50 overflow-hidden pointer-events-none">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Layers */}
      <NetworkCanvas />
      <SvgCircuits />
      
      {/* Soft Vignette Overlay to keep center text clear */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-50/20 to-slate-50/90"></div>
    </div>
  );
};
