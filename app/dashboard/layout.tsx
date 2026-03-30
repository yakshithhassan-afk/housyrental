import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In production, you'd verify the Firebase session here
  // For now, we'll render the layout
  
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
