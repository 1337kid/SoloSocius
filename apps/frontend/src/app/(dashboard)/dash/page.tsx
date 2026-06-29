import { HomeFeedView } from "@/features/feed/components/HomeFeedView";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your Feed</h1>
          <p className="text-muted-foreground">
            Posts from accounts you follow
          </p>
        </div>

        {/* Feed */}
        <HomeFeedView />
      </div>
    </main>
  );
}
