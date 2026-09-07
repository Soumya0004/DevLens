import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Settings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Workspace preferences</h1>
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>GitHub connection</CardTitle>
            <CardDescription>Connect your account to unlock repository analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">GitHub access token</label>
              <Input type="password" placeholder="ghp_xxxxxxxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Default organization</label>
              <Input defaultValue="acme-engineering" />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
