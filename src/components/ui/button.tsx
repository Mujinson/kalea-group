import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative cursor-pointer text-center font-medium inline-flex items-center justify-center uppercase rounded-lg transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-foreground focus:outline-offset-4 overflow-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white text-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "bg-transparent text-foreground border border-foreground/20",
        secondary: "bg-white text-foreground",
        ghost: "bg-transparent text-foreground",
        link: "text-foreground underline-offset-4 hover:underline bg-transparent",
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

// Animated decorations with black borders
const ButtonDecorations = () => (
  <>
    {/* Light sweep effect */}
    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-foreground/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out pointer-events-none" />
    
    {/* Corner borders - black */}
    <span className="w-1/2 drop-shadow-lg transition-all duration-300 block border-foreground absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0 pointer-events-none" />
    <span className="w-1/2 drop-shadow-lg transition-all duration-300 block border-foreground absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0 pointer-events-none" />
    <span className="w-1/2 drop-shadow-lg transition-all duration-300 block border-foreground absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0 pointer-events-none" />
    <span className="w-1/2 drop-shadow-lg transition-all duration-300 block border-foreground absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0 pointer-events-none" />
  </>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const isLink = variant === "link";
    const classes = cn(buttonVariants({ variant, size, className }));
    
    // For link variant, no decorations
    if (isLink) {
      return (
        <button className={classes} ref={ref} {...props}>
          {children}
        </button>
      );
    }
    
    // For asChild, clone the child element and inject decorations
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        children: (
          <>
            <span className="relative z-20 flex items-center gap-2">{child.props.children}</span>
            <ButtonDecorations />
          </>
        ),
      } as React.HTMLAttributes<HTMLElement>);
    }
    
    // For regular buttons
    return (
      <button className={classes} ref={ref} {...props}>
        <span className="relative z-20 flex items-center gap-2">{children}</span>
        <ButtonDecorations />
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };