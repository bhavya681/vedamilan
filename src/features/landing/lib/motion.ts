export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const entrance = { duration: 0.55, ease: easeOutExpo };
export const springSoft = { type: "spring" as const, stiffness: 80, damping: 18, mass: 0.8 };
export const springMagnetic = { type: "spring" as const, stiffness: 240, damping: 18, mass: 0.4 };
