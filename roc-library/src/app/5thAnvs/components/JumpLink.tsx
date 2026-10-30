"use client";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

/** The nearest ancestor that scrolls up and down: the page scrolls inside the Shell, not the window. */
function scrollParent(el: HTMLElement): HTMLElement {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const overflow = getComputedStyle(p).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scrolls the section with this id to just under the Navbar and the Section nav, smoothly. The
 * animation is drawn here, not by the browser's own smooth scroll, which a system with its animation
 * effects turned off (Windows) silently skips. The target is measured again on every frame, so a picture
 * that loads on the way cannot make it stop short. Touching the wheel, screen or keys stops it.
 */
function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const scroller = scrollParent(el);
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const scrollerTop = scroller === document.scrollingElement ? 0 : scroller.getBoundingClientRect().top;
  const targetNow = () => scroller.scrollTop + el.getBoundingClientRect().top - scrollerTop - margin;

  const from = scroller.scrollTop;
  const distance = Math.abs(targetNow() - from);
  const duration = Math.min(900, Math.max(450, distance * 0.35));
  const began = performance.now();
  history.replaceState(null, "", `#${id}`);

  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of ["wheel", "touchstart", "keydown", "mousedown"]) window.removeEventListener(type, stop);
  };
  for (const type of ["wheel", "touchstart", "keydown", "mousedown"]) {
    window.addEventListener(type, stop, { passive: true });
  }
  const step = (now: number) => {
    const t = Math.min(1, (now - began) / duration);
    scroller.scrollTop = from + (targetNow() - from) * easeInOut(t);
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}

/** A link to a place on the same page: it still works as a plain link, and smooth-scrolls when it can. */
export default function JumpLink({
  id,
  onClick,
  ...rest
}: { id: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const handle = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (!document.getElementById(id)) return;
    event.preventDefault();
    jumpTo(id);
  };
  return <a href={`#${id}`} onClick={handle} {...rest} />;
}
