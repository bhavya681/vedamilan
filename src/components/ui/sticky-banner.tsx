"use client";
import React, { SVGProps, useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils/index";

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
  onOpenChange,
  onDismiss,
}: {
  className?: string;
  children: React.ReactNode;
  hideOnScroll?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
}) => {
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    onOpenChange?.(open && !dismissed);
  }, [open, dismissed, onOpenChange]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (dismissed) return;
    if (hideOnScroll && latest > 40) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const visible = open && !dismissed;

  return (
    <motion.div
      className={cn(
        "sticky inset-x-0 top-0 z-40 flex w-full items-center justify-center overflow-hidden bg-transparent px-4",
        visible ? "min-h-12 py-2 sm:min-h-14" : "pointer-events-none min-h-0 py-0",
        className,
      )}
      initial={{
        y: -100,
        opacity: 0,
      }}
      animate={{
        y: visible ? 0 : -24,
        opacity: visible ? 1 : 0,
        height: visible ? "auto" : 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      role="region"
      aria-label="Site notice"
      aria-hidden={!visible}
    >
      {children}

      <motion.button
        type="button"
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        aria-label="Dismiss notice"
      >
        <CloseIcon className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
};

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
};
