import { cn } from "@/lib/utils";

interface BoltMarkProps extends React.SVGAttributes<SVGElement> {
  className?: string;
}

export function BoltMark({ className, ...props }: BoltMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      <path d="M14 2 L4 14 H11 L9 22 L20 10 H13 L14 2 Z" />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  showAdmin?: boolean;
}

export function Wordmark({ className, showAdmin = false }: WordmarkProps) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <BoltMark className="h-4 w-4" />
      </span>
      <span className="text-base">
        Bolt<span className="text-primary">Wear</span>
      </span>
      {showAdmin && (
        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Admin
        </span>
      )}
    </span>
  );
}
