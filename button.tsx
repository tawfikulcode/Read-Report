import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[transform,box-shadow,background-color,opacity,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-fg shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] hover:brightness-110 active:scale-[0.98]",
        glow: "bg-primary text-primary-fg btn-glow active:scale-[0.98]",
        outline:
          "border border-border bg-surface/60 text-fg hover:border-primary/40 hover:shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]",
        ghost: "text-muted hover:bg-surface hover:text-fg",
        accent:
          "bg-accent text-white hover:brightness-110 shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_40%,transparent)] active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
