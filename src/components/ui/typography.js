import React from "react";
import { cn } from "@/lib/utils";

// Define variant classes
const variantClasses = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-4",
  blockquote: "mt-6 border-l-2 pl-6 italic text-muted-foreground",
  small: "text-sm font-medium leading-none",
  code: "bg-muted rounded px-1.5 py-1 font-mono text-sm font-semibold",
};

// Typography component
const Typography = React.forwardRef(
  ({ as: Component = "p", variant = "p", className, children, ...props }, ref) => {
    const variantClass = variantClasses[variant] || variantClasses.p;

    return (
      <Component
        ref={ref}
        className={cn(variantClass, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";

// 👇 Only default export
export default Typography;
