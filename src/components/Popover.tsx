/**
 * Popover — click-triggered floating panel.
 *
 * Similar to Tooltip but opens on click and can contain interactive content
 * (links, buttons). Closes on outside click or Escape key.
 *
 * Usage:
 *   <Popover
 *     trigger={<button>Open</button>}
 *     content={<div className="p-4">Rich content here</div>}
 *   />
 *
 * Note: after running `npm i @floating-ui/react` you can replace the
 * position logic here with useFloating() for more robust placement.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  cloneElement,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface PopoverProps {
  /** The element that toggles the popover on click. */
  trigger: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  /** Content rendered inside the floating panel. */
  content: React.ReactNode;
  /** Preferred placement (default: "bottom-start"). */
  placement?: "bottom-start" | "bottom-end" | "bottom" | "top-start" | "top-end" | "top";
  /** Extra class names applied to the panel wrapper. */
  className?: string;
}

const GAP = 6;

interface Pos {
  top: number;
  left: number;
}

function computePos(
  ref: DOMRect,
  panelW: number,
  panelH: number,
  placement: PopoverProps["placement"],
  vp: { w: number; h: number },
): Pos {
  const p = placement ?? "bottom-start";
  let top: number;
  let left: number;

  if (p.startsWith("top")) {
    top = ref.top - panelH - GAP;
  } else {
    top = ref.bottom + GAP;
  }

  if (p.endsWith("start")) {
    left = ref.left;
  } else if (p.endsWith("end")) {
    left = ref.right - panelW;
  } else {
    left = ref.left + ref.width / 2 - panelW / 2;
  }

  // Clamp to viewport
  left = Math.max(8, Math.min(left, vp.w - panelW - 8));
  top = Math.max(8, Math.min(top, vp.h - panelH - 8));

  return { top, left };
}

export default function Popover({
  trigger,
  content,
  placement = "bottom-start",
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const refEl = useRef<HTMLElement | null>(null);
  const panelEl = useRef<HTMLDivElement | null>(null);

  // Compute position after panel is in DOM
  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const id = requestAnimationFrame(() => {
      if (!refEl.current || !panelEl.current) return;
      const ref = refEl.current.getBoundingClientRect();
      const panel = panelEl.current.getBoundingClientRect();
      setPos(computePos(ref, panel.width, panel.height, placement, {
        w: window.innerWidth,
        h: window.innerHeight,
      }));
    });
    return () => cancelAnimationFrame(id);
  }, [open, placement]);

  // Close on outside click
  const handleOutside = useCallback((e: MouseEvent) => {
    if (
      refEl.current?.contains(e.target as Node) ||
      panelEl.current?.contains(e.target as Node)
    ) return;
    setOpen(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousedown", handleOutside);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, handleOutside]);

  return (
    <>
      {cloneElement(trigger, {
        onClick(e: React.MouseEvent<HTMLElement>) {
          setOpen((v) => !v);
          trigger.props.onClick?.(e);
        },
        ref: ((el: HTMLElement | null) => {
          refEl.current = el;
          const childRef = (trigger as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
          if (typeof childRef === "function") childRef(el);
          else if (childRef && "current" in childRef) {
            (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
          }
        }) as React.Ref<HTMLElement>,
        "aria-expanded": open,
        "aria-haspopup": "true" as const,
      } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> })}

      {open &&
        createPortal(
          <div
            ref={panelEl}
            style={
              pos
                ? { position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }
                : { position: "fixed", top: -9999, left: -9999, zIndex: 9999, visibility: "hidden" }
            }
            className={cn("r-popover", className)}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
