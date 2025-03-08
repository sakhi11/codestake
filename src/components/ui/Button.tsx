
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-web3-blue disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-web3-blue text-white hover:bg-web3-blue/90",
        orange: "bg-web3-orange text-white hover:bg-web3-orange/90",
        glass: "glassmorphism text-white hover:bg-white/10",
        outline: "border border-white/20 text-white hover:bg-white/5",
        gradient: "bg-gradient-to-r from-web3-blue to-web3-orange text-white button-glow hover:brightness-110",
        ghost: "bg-transparent text-white hover:bg-white/5",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
