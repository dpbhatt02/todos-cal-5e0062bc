
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonCustomProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "link" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const ButtonCustom = React.forwardRef<HTMLButtonElement, ButtonCustomProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    size = "md", 
    isLoading = false,
    icon,
    iconPosition = "left",
    disabled,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "bg-background text-foreground border border-border hover:bg-muted/50 active:bg-muted",
      primary: "bg-primary text-primary-foreground hover:opacity-90 active:opacity-95",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
      ghost: "bg-transparent hover:bg-muted/50 active:bg-muted",
      link: "bg-transparent underline-offset-4 hover:underline text-primary",
      outline: "bg-transparent border border-input hover:bg-muted/50 active:bg-muted/80"
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-4 py-2 text-sm rounded-md",
      lg: "h-12 px-6 py-3 text-base rounded-lg",
      icon: "h-10 w-10 rounded-full flex items-center justify-center"
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        <span className={cn("flex items-center gap-2", isLoading && "invisible")}>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </span>
      </button>
    );
  }
);

ButtonCustom.displayName = "ButtonCustom";

export { ButtonCustom };
