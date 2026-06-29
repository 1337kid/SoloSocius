import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeFeedView } from "@/features/feed/components/HomeFeedView";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="bg-background">
      <div className="max-w-5xl mx-auto p-4 flex gap-3">
        <Card className="mb-auto w-xl">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <ScrollArea className="h-[calc(100vh-6rem)] border-primary/50 border-l pl-3">
          <HomeFeedView />
        </ScrollArea>
      </div>
    </main>
  );
}
