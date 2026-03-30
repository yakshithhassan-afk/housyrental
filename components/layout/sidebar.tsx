"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Properties", href: "/dashboard/properties", icon: Building2 },
  { name: "Tenants", href: "/dashboard/tenants", icon: Users },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r h-[calc(100vh-64px)] sticky top-16 hidden lg:block">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">AR</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName || "Admin User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role === 'OWNER' ? 'Property Owner' : 'Super Admin'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-red-500 transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
