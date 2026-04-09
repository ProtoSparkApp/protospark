import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-tighter transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand text-white shadow-[2px_2px_0px_#000]",
        secondary:
          "border-transparent bg-yellow-400 text-black shadow-[2px_2px_0px_#000]",
        destructive:
          "border-transparent bg-destructive text-white shadow-[2px_2px_0px_#000]",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
