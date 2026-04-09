import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-bold uppercase ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950 dark:border-white transition-all",
        className
      )}
      {...props}
    />
  )
}

export { Input }
