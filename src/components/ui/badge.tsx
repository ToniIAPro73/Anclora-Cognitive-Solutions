import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        backlog: "border-transparent bg-slate-500 text-white",
        proposal: "border-transparent bg-amber-500 text-white",
        approved: "border-transparent bg-emerald-500 text-white",
        in_progress: "border-transparent bg-blue-500 text-white",
        testing: "border-transparent bg-purple-500 text-white",
        completed: "border-transparent bg-green-600 text-white",
        cancelled: "border-transparent bg-red-500 text-white",
        // Priority variants
        low: "border-transparent bg-slate-400 text-white",
        medium: "border-transparent bg-blue-500 text-white",
        high: "border-transparent bg-amber-500 text-white",
        urgent: "border-transparent bg-red-500 text-white",
        // Alert priority variants
        critical: "border-transparent bg-red-600 text-white",
        // Invoice status
        draft: "border-transparent bg-slate-400 text-white",
        sent: "border-transparent bg-blue-500 text-white",
        paid: "border-transparent bg-green-600 text-white",
        overdue: "border-transparent bg-red-500 text-white",
        // Quote status
        viewed: "border-transparent bg-purple-500 text-white",
        accepted: "border-transparent bg-green-600 text-white",
        rejected: "border-transparent bg-red-500 text-white",
        // Verifactu status
        not_registered: "border-transparent bg-slate-400 text-white",
        pending: "border-transparent bg-amber-500 text-white",
        registered: "border-transparent bg-emerald-500 text-white",
        error: "border-transparent bg-red-500 text-white",
        verifactu_cancelled: "border-transparent bg-gray-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
