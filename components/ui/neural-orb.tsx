'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NeuralOrbProps {
    state?: 'idle' | 'active' | 'thinking';
    className?: string;
    onClick?: () => void;
}

/**
 * NeuralOrb v2.0 - Premium 2026 Design
 * Inspired by: Apple Intelligence orb, Gemini logo, minimal AI UX
 * Features: Clean gradient, subtle glow, no excessive animations
 */
export function NeuralOrb({ state = 'idle', className, onClick }: NeuralOrbProps) {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative w-14 h-14 cursor-pointer group",
                className
            )}
        >
            {/* Outer Glow - Subtle, no pulsing */}
            <div className={cn(
                "absolute inset-0 rounded-full blur-xl transition-all duration-700",
                state === 'idle' && "bg-cyan-500/15",
                state === 'active' && "bg-cyan-400/30",
                state === 'thinking' && "bg-cyan-400/40"
            )} />

            {/* Main Orb Body - Premium Glass Effect */}
            <div className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950",
                "border border-slate-700/50",
                "shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.5)]",
                "overflow-hidden"
            )}>
                {/* Inner Gradient Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                {/* Centered Icon - Modern AI Symbol */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {state === 'thinking' ? (
                        // Thinking: Animated rings
                        <motion.div
                            className="relative w-6 h-6"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        >
                            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/60 border-t-transparent" />
                            <div className="absolute inset-1 rounded-full border border-cyan-500/40 border-b-transparent" />
                        </motion.div>
                    ) : (
                        // Idle/Active: Modern sparkle icon
                        <svg
                            viewBox="0 0 24 24"
                            className={cn(
                                "w-6 h-6 transition-all duration-300",
                                state === 'active' ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                            )}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            {/* Modern AI/Sparkle icon */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Status Indicator - Clean, no animation */}
            {state !== 'idle' && (
                <div className={cn(
                    "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900",
                    state === 'active' && "bg-emerald-500",
                    state === 'thinking' && "bg-amber-400"
                )} />
            )}
        </motion.div>
    );
}
