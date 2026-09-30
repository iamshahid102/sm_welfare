"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /**
   * Rendered element. Defaults to a `div`; pass `"li"`, `"article"`, `"section"`
   * … when the wrapper has to sit inside a semantic parent (e.g. inside a
   * `<ul>`), so no invalid markup is produced.
   */
  as?: ElementType;
  className?: string;
  /**
   * Extra delay in milliseconds before the animation starts. Used to cascade a
   * row of cards so they rise one after another instead of together.
   */
  delay?: number;
  /** Distance (px) the element travels up as it fades in. Defaults to the CSS value. */
  y?: number;
  /** Optional starting scale (e.g. 0.96) for photo/panel reveals. */
  scale?: number;
}

/**
 * Fades + slides its children in the first time they scroll into view.
 *
 * HOW IT WORKS
 * The element ships with the `.reveal` class (hidden state, defined in
 * globals.css) and gets `.is-visible` added by an IntersectionObserver once it
 * enters the viewport. The observer then unobserves — every element animates
 * exactly once, so scrolling back up does not replay it.
 *
 * WHY NO REACT STATE
 * The visible flag only ever needs to reach the DOM, and toggling it through
 * `useState` from inside an effect fights the `react-hooks/set-state-in-effect`
 * lint rule. Mutating the class list directly keeps the component render-free
 * after mount (no re-render for a purely visual change) and costs nothing.
 *
 * ACCESSIBILITY
 * `prefers-reduced-motion` is handled in CSS: the hidden state is dropped and
 * the children are simply shown. Environments without IntersectionObserver
 * (and visitors with JavaScript disabled, via the `<noscript>` rule in the
 * root layout) also fall straight through to the visible state, so content is
 * never left invisible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y,
  scale,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    /**
     * Mark the element as revealed.
     *
     * Both a class and a data attribute are set: React owns `className`, so a
     * parent re-render that produces a different class string would rewrite
     * the attribute and drop the class again. `data-revealed` is never part of
     * the props, so React leaves it alone — the stylesheet accepts either.
     */
    const reveal = (target: Element) => {
      target.classList.add("is-visible");
      (target as HTMLElement).dataset.revealed = "true";
    };

    if (typeof IntersectionObserver === "undefined") {
      reveal(element);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      // Start slightly before the element is fully in view, and ignore
      // elements that only graze the very bottom edge of the viewport.
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Custom properties are not part of CSSProperties, so the object is widened
  // to allow the two `--reveal-*` inputs the stylesheet reads.
  const style: CSSProperties & Record<string, string | number> = {};
  if (delay) style.transitionDelay = `${delay}ms`;
  if (y !== undefined) style["--reveal-y"] = `${y}px`;
  if (scale !== undefined) style["--reveal-scale"] = scale;

  return (
    <Tag ref={ref} className={cn("reveal", className)} style={style}>
      {children}
    </Tag>
  );
}
