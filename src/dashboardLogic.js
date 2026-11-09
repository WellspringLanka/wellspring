import { useState, useEffect } from 'react';

// Clean, high-trust medical & clinical photography
export const SLIDER_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80', // Modern hospital atrium
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1920&q=80', // Clean medical building architecture
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1920&q=80', // Clinical care specialist
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1920&q=80'  // Modern healthcare interior
];

export function useDashboardLogic() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock states for staff online presence (we will connect this to the backend later)
  const [doctorOnline, setDoctorOnline] = useState(true);
  const [counterOnline, setCounterOnline] = useState(true);

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

  // Smooth scroll-blending math for the center Wellspring title
  const heroOpacity = Math.max(0.08, 1 - scrollY / 450);
  const heroScale = Math.max(0.9, 1 - scrollY / 2800);
  const heroTranslateY = scrollY * 0.32;
  const heroBlur = Math.min(5, scrollY / 100);

  // Trigger the 4 tiles to slide in seamlessly as the user scrolls down
  const tilesVisible = scrollY > 80;

  return {
    currentSlide,
    setCurrentSlide,
    currentTime,
    doctorOnline,
    counterOnline,
    heroStyle: {
      opacity: heroOpacity,
      transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
      filter: `blur(${heroBlur}px)`
    },
    tilesVisible
  };
}