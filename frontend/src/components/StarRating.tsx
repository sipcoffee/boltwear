import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface StarsProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE: Record<NonNullable<StarsProps["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function Stars({ value, size = "md", className }: StarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = value >= s;
        const partial = !filled && value > s - 1;
        return (
          <span key={s} className="relative inline-block">
            <Star className={cn(SIZE[size], "text-muted-foreground/40")} />
            {(filled || partial) && (
              <span
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : `${(value - (s - 1)) * 100}%` }}
              >
                <Star className={cn(SIZE[size], "fill-amber-400 text-amber-400")} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

export function StarInput({ value, onChange, size = "lg" }: StarInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((s) => {
        const active = display >= s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            aria-label={`${s} star${s === 1 ? "" : "s"}`}
            className="rounded p-0.5 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={cn(
                SIZE[size],
                active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
