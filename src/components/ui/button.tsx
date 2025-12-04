import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center uppercase font-semibold text-sm border-2 border-foreground text-foreground bg-white cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-foreground text-foreground bg-white",
        destructive: "border-destructive text-destructive bg-white",
        outline: "border-foreground/30 text-foreground bg-transparent",
        secondary: "border-foreground text-foreground bg-white",
        ghost: "border-transparent text-foreground bg-transparent",
        link: "border-transparent text-foreground underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "px-8 py-4 text-sm",
        sm: "px-6 py-3 text-xs",
        lg: "px-10 py-4 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Animated overlays for reveal effect
const ButtonOverlays = () => (
  <>
    {/* Horizontal overlay - covers top and bottom edges */}
    <span 
      className="absolute top-[6px] left-[-2px] w-[calc(100%+4px)] bg-white transition-transform duration-300 ease-in-out origin-center group-hover:scale-y-0 pointer-events-none z-[1]"
      style={{ height: 'calc(100% - 12px)' }}
    />
    {/* Vertical overlay - covers left and right edges */}
    <span 
      className="absolute left-[6px] top-[-2px] h-[calc(100%+4px)] bg-white transition-transform duration-300 ease-in-out delay-500 origin-center group-hover:scale-x-0 pointer-events-none z-[2]"
      style={{ width: 'calc(100% - 12px)' }}
    />
  </>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const isLink = variant === "link";
    const isGhost = variant === "ghost";
    const classes = cn(buttonVariants({ variant, size, className }), "group");
    
    // For link or ghost variant, no overlays
    if (isLink || isGhost) {
      return (
        <button className={classes} ref={ref} {...props}>
          {children}
        </button>
      );
    }
    
    // For asChild, clone the child element and inject overlays
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        children: (
          <>
            <span className="relative z-[3] flex items-center gap-2">{child.props.children}</span>
            <ButtonOverlays />
          </>
        ),
      } as React.HTMLAttributes<HTMLElement>);
    }
    
    // For regular buttons
    return (
      <button className={classes} ref={ref} {...props}>
        <span className="relative z-[3] flex items-center gap-2">{children}</span>
        <ButtonOverlays />
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };