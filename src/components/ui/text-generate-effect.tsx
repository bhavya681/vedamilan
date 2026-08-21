"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils/index";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  wordClassName,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  wordClassName?: string;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      }
    );
  }, [animate, duration, filter]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={cn("opacity-0", wordClassName ?? "dark:text-white text-black")}
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-medium", className)}>
      <div className="text-base leading-relaxed tracking-wide sm:text-lg">
        {renderWords()}
      </div>
    </div>
  );
};
