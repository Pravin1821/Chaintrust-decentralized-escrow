// Animation variants for consistent motion language
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 },
};

export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

export const buttonPress = {
  whileTap: { scale: 0.96 },
  transition: { duration: 0.1 },
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(6, 182, 212, 0)",
      "0 0 20px rgba(6, 182, 212, 0.3)",
      "0 0 0px rgba(6, 182, 212, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Utility: Respect prefers-reduced-motion
export const shouldReduceMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Get safe animation duration
export const getAnimationDuration = (defaultDuration) => {
  return shouldReduceMotion() ? 0 : defaultDuration;
};
