import { useState, useEffect, useRef } from 'react';

// Clean, high-trust medical & clinical photography
export const SLIDER_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1920&q=80'
];

export function useDashboardLogic() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Staff Online Status
  const [doctorOnline] = useState(true);
  const [counterOnline] = useState(true);

  // Privacy-Safe Aggregate Clinic Telemetry (Mocked until Backend API is connected)
  const [telemetry, setTelemetry] = useState({
    activeQueue: 4,
    servedToday: 38,
    roomStatus: 'Consultation Active'
  });

  // Canvas reference for the Ambient Particle Network
  const canvasRef = useRef(null);

  // 1. Automatic Background Image Slider (Changes every 6 seconds)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  // 2. Scroll Listener for Hero Blending & Tile Slide-In
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Live Clock 
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 4. Ambient Molecular Particle Network (Canvas Animation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const mouse = { x: null, y: null, radius: 130 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create 55 subtle medical-blue floating nodes
    const particleCount = 55;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2 + 1
    }));

    const renderParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125, 211, 252, 0.55)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.16 * (1 - dist / 135)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dxMouse = p.x - mouse.x;
          const dyMouse = p.y - mouse.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(186, 230, 253, ${0.28 * (1 - distMouse / mouse.radius)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderParticles);
    };

    renderParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Smooth scroll-blending math for the center Wellspring title
  const heroOpacity = Math.max(0.08, 1 - scrollY / 480);
  const heroScale = Math.max(0.9, 1 - scrollY / 2800);
  const heroTranslateY = scrollY * 0.3;
  const heroBlur = Math.min(5, scrollY / 105);

  // Trigger the 4 tiles to slide in seamlessly as the user scrolls down
  const tilesVisible = scrollY > 75;

  return {
    canvasRef,
    currentSlide,
    setCurrentSlide,
    currentTime,
    doctorOnline,
    counterOnline,
    telemetry,
    heroStyle: {
      opacity: heroOpacity,
      transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
      filter: `blur(${heroBlur}px)`
    },
    tilesVisible
  };
}