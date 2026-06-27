import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  loading?: boolean;
};

export function AuthShell({
  title,
  description,
  children,
  loading = false,
}: AuthShellProps) {
  return (
    <div className="relative w-full overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.16),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 space-y-3 text-center">

          <div className="space-y-1">
            <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">
              Solosocius
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground text-pretty">
              {description}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "rounded-2xl border border-border/80 bg-card/90 p-6 shadow-xl shadow-black/10 backdrop-blur-sm sm:p-8",
            loading && "animate-pulse",
          )}
        >
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 rounded-lg bg-muted" />
              <div className="h-10 rounded-lg bg-muted" />
              <div className="h-10 rounded-lg bg-muted" />
              <div className="h-9 rounded-lg bg-muted" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
