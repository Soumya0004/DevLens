import { YellowLineLoader } from "@/components/ui/yellow-line-loader";

export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0d1117] px-6">
      <YellowLineLoader label="Loading DevLens" className="flex-col gap-4" />
    </main>
  );
}