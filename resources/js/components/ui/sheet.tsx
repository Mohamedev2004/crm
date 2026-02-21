/* eslint-disable import/order */
"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal {...props} />;
}

// Overlay with blur + semi-transparent background + fade animation
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay ref={ref} asChild {...props}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm",
        className
      )}
    />
  </SheetPrimitive.Overlay>
));
SheetOverlay.displayName = "SheetOverlay";

// Content with blur + slide animation + rounded corners
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }
>(({ className, children, side = "right", ...props }, ref) => {
  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
      x: side === "right" ? 50 : side === "left" ? -50 : 0,
      y: side === "bottom" ? 50 : side === "top" ? -50 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
      x: side === "right" ? 50 : side === "left" ? -50 : 0,
      y: side === "bottom" ? 50 : side === "top" ? -50 : 0,
    },
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", duration: 0.5, bounce: 0 }}
          className={cn(
            "fixed z-50 flex flex-col justify-start bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/10 shadow-2xl p-6 gap-4 sm:rounded-l-2xl overflow-y-auto",
            side === "right" && "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
            side === "left" && "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
            side === "top" && "inset-x-0 top-0 h-auto w-full border-b",
            side === "bottom" && "inset-x-0 bottom-0 h-auto w-full border-t",
            className
          )}
        >
          {children}
          <SheetPrimitive.Close className="absolute top-4 right-4 rounded-full p-1 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});

SheetContent.displayName = "SheetContent";

// Header / Footer / Title / Description
const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} className={cn("flex flex-col gap-1.5 p-4", props.className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} className={cn("mt-auto flex flex-col gap-2 p-4", props.className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  (props, ref) => <SheetPrimitive.Title ref={ref} className={cn("text-foreground font-semibold", props.className)} {...props} />
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <SheetPrimitive.Description ref={ref} className={cn("text-muted-foreground text-sm", props.className)} {...props} />
);
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
