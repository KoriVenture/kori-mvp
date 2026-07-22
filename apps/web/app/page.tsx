import { Button } from "@kori/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kori/ui/components/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Kori MVP</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Milestone-based investment escrow platform.
          </p>

          <Button>Connect wallet</Button>
        </CardContent>
      </Card>
    </main>
  );
}