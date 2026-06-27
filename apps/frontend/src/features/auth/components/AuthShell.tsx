import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

      <div className="relative mx-auto w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Solosocius
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Card */}
        <Card>
          {loading ? (
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          ) : (
            <CardContent className="pt-6">{children}</CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
