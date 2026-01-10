
'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassIconProps {
    icon: LucideIcon;
    className?: string;
    active?: boolean;
    size?: number;
}

export function GlassIcon({ icon: Icon, className, active, size = 20 }: GlassIconProps) {
    return (
        <div className={cn("relative group flex items-center justify-center", className)}>
            {/* Background Glow (Active State) */}
            {active && (
                <motion.div
                    layoutId="icon-active-glow"
                    className="absolute inset-0 bg-primary/20 blur-md rounded-full"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* Main Icon Layer (Foreground) */}
            <Icon
                size={size}
                className={cn(
                    "relative z-10 transition-all duration-300",
                    active ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-muted-foreground group-hover:text-foreground"
                )}
            />

            {/* Duotone Layer (Background/Ghost) - Simulates depth */}
            <Icon
                size={size}
                className={cn(
                    "absolute z-0 opacity-0 transition-all duration-300 transform scale-110 blur-[1px]",
                    active ? "opacity-30 text-primary translate-y-[1px]" : "group-hover:opacity-20 text-foreground translate-y-[1px]"
                )}
            />

            {/* Removed sparkle micro-interaction - too visually noisy */}
        </div>
    );
}
