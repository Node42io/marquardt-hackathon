/**
 * Tooltip — hover-triggered floating label with auto-positioning.
 *
 * Renders via a portal so it is never clipped by overflow:hidden parents
 * (fixes Kano feature label cut-off, item #6 and ODI hover formula item #5).
 * Flips preferred placement when there is not enough room on screen.
 *
 * Usage:
 *   <Tooltip content="Opportunity = Importance + max(Importance − Satisfaction, 0)">
 *     <span className="...">hover me</span>
 *   </Tooltip>
 *
 * Note: after running `npm i @floating-ui/react` you can replace the
 * position logic here with useFloating() for even more precise placement.
 */

import { useState, useRef, useEffect, cloneElement } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface TooltipProps {
  /** Tooltip label / content. Can be a string or any React node. */
  content: React.ReactNode;
  /** The element that triggers the tooltip on hover. */
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  /** Preferred placement. Auto-flips if no room (default: "top"). */
  placement?: "top" | "bottom" | "left" | "right";
  /** Extra class names for the tooltip bubble. */
  className?: string;
}

const GAP = 8; // px gap between reference and tooltip bubble

interface Pos {
  top: number;
  left: number;
}

function resolvePos(
  ref: DOMRect,
  tipW: number,
  tipH: number,
  preferred: "top" | "bottom" | "left" | "right",
  vp: { w: number; h: number },
): Pos {
  const candidates: Array<"top" | "bottom" | "left" | "right"> = [
    preferred,
    preferred === "top" ? "bottom"
      : preferred === "bottom" ? "top"
      : preferred === "left" ? "right"
      : "left",
  ];

  for (const side of candidates) {
    let top: number;
    let left: number;

    if (side === "top") {
      top = ref.top - tipH - GAP;
      left = ref.left + ref.width / 2 - tipW / 2;
    } else if (side === "bottom") {
      top = ref.bottom + GAP;
      left = ref.left + ref.width / 2 - tipW / 2;
    } else if (side === "left") {
      top = ref.top + ref.height / 2 - tipH / 2;
      left = ref.left - tipW - GAP;
    } else {
      top = ref.top + ref.height / 2 - tipH / 2;
      left = ref.right + GAP;
    }

    // Shift to stay inside viewport with 8px margin
    left = Math.max(8, Math.min(left, vp.w - tipW - 8));
    top = Math.max(8, Math.min(top, vp.h - tipH - 8));

    // If it fits, use it
    if (top >= 0 && left >= 0 && top + tipH <= vp.h && left + tipW <= vp.w) {
      return { top, left };
    }
  }

  // Last resort — return last computed position (already clamped)
  const last = candidates[candidates.length - 1];
  const top = last === "top" ? ref.top - tipH - GAP : ref.bottom + GAP;
  const left = Math.max(8, Math.min(ref.left + ref.width / 2 - tipW / 2, vp.w - tipW - 8));
  return { top: Math.max(8, top), left };
}

export default function Tooltip({
  content,
  children,
  placement = "top",
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const refEl = useRef<HTMLElement | null>(null);
  const tipEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    // Measure on next paint so the tooltip has been painted (visibility:hidden)
    const id = requestAnimationFrame(() => {
      if (!refEl.current || !tipEl.current) return;
      const ref = refEl.current.getBoundingClientRect();
      const tip = tipEl.current.getBoundingClientRect();
      setPos(resolvePos(ref, tip.width, tip.height, placement, {
        w: window.innerWidth,
        h: window.innerHeight,
      }));
    });
    return () => cancelAnimationFrame(id);
  }, [open, placement]);

  return (
    <>
      {cloneElement(children, {
        onMouseEnter(e: React.MouseEvent<HTMLElement>) {
          setOpen(true);
          children.props.onMouseEnter?.(e);
        },
        onMouseLeave(e: React.MouseEvent<HTMLElement>) {
          setOpen(false);
          children.props.onMouseLeave?.(e);
        },
        onFocus(e: React.FocusEvent<HTMLElement>) {
          setOpen(true);
          children.props.onFocus?.(e);
        },
        onBlur(e: React.FocusEvent<HTMLElement>) {
          setOpen(false);
          children.props.onBlur?.(e);
        },
        // Attach our ref while preserving any existing ref on the child.
        // React 19's cloneElement props type doesn't include `ref`, so cast.
        ref: ((el: HTMLElement | null) => {
          refEl.current = el;
          const childRef = (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
          if (typeof childRef === "function") childRef(el);
          else if (childRef && "current" in childRef) {
            (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
          }
        }) as React.Ref<HTMLElement>,
      } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> })}

      {open &&
        createPortal(
          <div
            ref={tipEl}
            role="tooltip"
            style={
              pos
                ? { position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }
                : { position: "fixed", top: -9999, left: -9999, zIndex: 9999, visibility: "hidden" }
            }
            className={cn("r-tooltip", className)}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
