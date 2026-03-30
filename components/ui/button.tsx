import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    default: "bg-primary text-white hover:bg-primary-dark",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "hover:bg-muted text-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    destructive: "bg-danger text-white hover:bg-danger/90",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
