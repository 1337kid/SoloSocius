import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type AuthShellProps = {
  title: string
  description: string
  children?: React.ReactNode
  loading?: boolean
}

export function AuthShell({
  title,
  description,
  children,
  loading = false,
}: AuthShellProps) {
  return (
    <div data-slot="auth-screen">
      <div data-slot="auth-column">
        <div data-slot="auth-intro">
          <p data-slot="auth-kicker">SoloSocius</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {loading ? (
            <CardContent>
              <Skeleton variant="line" />
              <Skeleton variant="body" />
              <Skeleton variant="line" />
              <Skeleton variant="body" />
              <Skeleton variant="title" />
            </CardContent>
          ) : (
            <CardContent>{children}</CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
