import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-2 border-black dark:border-white bg-clip-padding text-sm font-bold uppercase tracking-tight whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive active:translate-x-[2px] active:translate-y-[2px] active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-brutal hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_#000] dark:hover:shadow-[6px_6px_0px_#fff]",
        outline:
          "bg-white text-black shadow-brutal hover:bg-gray-50 dark:bg-zinc-900 dark:text-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-brutal hover:bg-secondary/80",
        ghost:
          "border-transparent bg-transparent shadow-none hover:border-black dark:hover:border-white active:translate-x-0 active:translate-y-0",
        destructive:
          "bg-destructive text-white shadow-brutal hover:bg-destructive/90",
        neo: "bg-brand text-white shadow-brutal hover:bg-brand/90",
        link: "border-none shadow-none hover:underline active:translate-x-0 active:translate-y-0 bg-transparent",
      },
      size: {
        default:
          "h-10 gap-2 px-6",
        xs: "h-7 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-4 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-8 text-base",
        xl: "h-16 gap-3 px-12 text-xl",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
