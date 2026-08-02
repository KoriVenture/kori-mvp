"use client";

import { cn } from "@kori/ui/lib/utils";
import { type ComponentProps, useEffect, useRef, useState } from "react";

type RevealOnScrollProps = ComponentProps<"div"> & {
  delay?: 0 | 1 | 2 | 3 | 4;
};

export function RevealOnScroll({
  className,
  delay = 0,
  ...props
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible}
      className={cn(
        "reveal-item",
        delay > 0 && `reveal-delay-${delay}`,
        className,
      )}
      {...props}
    />
  );
}
