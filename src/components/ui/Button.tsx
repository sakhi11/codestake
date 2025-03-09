
import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "glass";
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "md";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          variant === "default" && "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          variant === "destructive" && "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
          variant === "outline" && "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "link" && "text-primary underline-offset-4 hover:underline",
          variant === "gradient" && "bg-gradient-to-r from-web3-blue to-web3-orange text-white shadow-lg hover:shadow-xl",
          variant === "glass" && "backdrop-blur-sm bg-white/10 border border-white/20 text-white shadow-sm hover:bg-white/20",
          
          // Sizes
          size === "default" && "h-9 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-10 rounded-md px-8",
          size === "xl" && "h-14 rounded-md px-8 text-lg",
          size === "md" && "h-9 rounded-md px-5 py-2.5",
          size === "icon" && "h-9 w-9",
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// Add buttonVariants for our components that need it
const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) => {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          
    // Variants
    variant === "default" && "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    variant === "destructive" && "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    variant === "outline" && "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
    variant === "secondary" && "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
    variant === "link" && "text-primary underline-offset-4 hover:underline",
    variant === "gradient" && "bg-gradient-to-r from-web3-blue to-web3-orange text-white shadow-lg hover:shadow-xl",
    variant === "glass" && "backdrop-blur-sm bg-white/10 border border-white/20 text-white shadow-sm hover:bg-white/20",
          
    // Sizes
    size === "default" && "h-9 px-4 py-2",
    size === "sm" && "h-8 rounded-md px-3 text-xs",
    size === "lg" && "h-10 rounded-md px-8",
    size === "xl" && "h-14 rounded-md px-8 text-lg",
    size === "md" && "h-9 rounded-md px-5 py-2.5",
    size === "icon" && "h-9 w-9",
          
    className
  );
};

Button.displayName = "Button";

export { Button, buttonVariants };
