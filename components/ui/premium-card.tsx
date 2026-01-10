import * as React from "react"
import { cn } from "@/lib/utils"

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
    glow?: boolean
    variant?: "default" | "glass" | "solid"
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
    ({ className, glow = false, variant = "glass", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl transition-all duration-300 relative overflow-hidden group",
                    // Variants
                    variant === "glass" && "bg-card/30 dark:bg-slate-900/50 backdrop-blur-xl border border-border/50 dark:border-slate-800",
                    variant === "solid" && "bg-card border border-border",
                    variant === "default" && "bg-card text-card-foreground border border-border",
                    // Hovers & Glows
                    "hover:border-primary/50",
                    glow && "hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.2)]",
                    className
                )}
                {...props}
            >
                {/* Optional: Inner Gradient Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 dark:from-white/5 dark:to-transparent group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 text-foreground">
                    {props.children}
                </div>
            </div>
        )
    }
)
PremiumCard.displayName = "PremiumCard"

export { PremiumCard }
