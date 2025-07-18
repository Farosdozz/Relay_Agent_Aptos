export const navVariants = {
  open: {
    opacity: 1,
    height: 100,
    y: 20,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
  closed: {
    opacity: 0,
    height: 0,
    y: 20,
    transition: { staggerChildren: 0.07, delayChildren: 0.5 }, // Added delayChildren
  },
};
export const itemVariants = {
  open: {
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
      delay: 0.2, // Delay for children animations
    },
  },
  closed: {
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};
