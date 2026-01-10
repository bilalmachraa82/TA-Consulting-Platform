'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReadinessGaugeProps {
    score: number;
    confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function ReadinessGauge({
    score,
    confidence,
    size = 'md',
    showLabel = true
}: ReadinessGaugeProps) {
    const normalizedScore = Math.max(0, Math.min(100, score));

    const getColor = () => {
        if (normalizedScore >= 70) return { stroke: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-500' };
        if (normalizedScore >= 40) return { stroke: '#eab308', bg: 'bg-yellow-500/10', text: 'text-yellow-500' };
        return { stroke: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500' };
    };

    const getConfidenceLabel = () => {
        switch (confidence) {
            case 'ALTA': return 'Alta Confiança';
            case 'MEDIA': return 'Confiança Média';
            case 'BAIXA': return 'Dados Incompletos';
        }
    };

    const dimensions = {
        sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg' },
        md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
        lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl' },
    };

    const { width, strokeWidth, fontSize } = dimensions[size];
    const radius = (width - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
    const colors = getColor();

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width, height: width }}>
                {/* Background circle */}
                <svg
                    width={width}
                    height={width}
                    className="transform -rotate-90"
                >
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted/20"
                    />
                    <motion.circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className={cn('font-bold', fontSize, colors.text)}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        {normalizedScore}
                    </motion.span>
                </div>
            </div>

            {showLabel && (
                <div className="text-center">
                    <p className={cn('text-xs font-medium', colors.text)}>
                        {getConfidenceLabel()}
                    </p>
                </div>
            )}
        </div>
    );
}
