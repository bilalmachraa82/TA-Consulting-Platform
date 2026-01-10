'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, FileText, Building2, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchResult } from '@/lib/eligibility-engine';

interface EligibilityChecklistProps {
    match: MatchResult;
    expanded?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
    'Região': <MapPin className="h-4 w-4" />,
    'Dimensão': <Building2 className="h-4 w-4" />,
    'CAE': <Briefcase className="h-4 w-4" />,
    'Documentação': <FileText className="h-4 w-4" />,
};

function getIcon(text: string) {
    for (const [key, icon] of Object.entries(iconMap)) {
        if (text.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    return <CheckCircle2 className="h-4 w-4" />;
}

export function EligibilityChecklist({ match, expanded: initialExpanded = false }: EligibilityChecklistProps) {
    const [expanded, setExpanded] = useState(initialExpanded);

    const hasReasons = match.reasons.length > 0;
    const hasMissing = match.missing.length > 0;

    return (
        <div className="border rounded-lg overflow-hidden bg-card">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        {hasReasons && (
                            <span className="flex items-center gap-1 text-green-500 text-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                {match.reasons.length}
                            </span>
                        )}
                        {hasMissing && (
                            <span className="flex items-center gap-1 text-yellow-500 text-sm ml-2">
                                <AlertTriangle className="h-4 w-4" />
                                {match.missing.length}
                            </span>
                        )}
                    </div>
                    <span className="text-sm font-medium">Checklist de Elegibilidade</span>
                </div>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 space-y-4">
                            {/* Reasons (Green) */}
                            {hasReasons && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Critérios Satisfeitos
                                    </p>
                                    <ul className="space-y-2">
                                        {match.reasons.map((reason, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <span className="text-green-500 mt-0.5">
                                                    {getIcon(reason)}
                                                </span>
                                                <span>{reason}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Missing (Yellow/Red) */}
                            {hasMissing && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        A Confirmar / Em Falta
                                    </p>
                                    <ul className="space-y-2">
                                        {match.missing.map((item, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: (match.reasons.length + idx) * 0.1 }}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <span className="text-yellow-500 mt-0.5">
                                                    <AlertTriangle className="h-4 w-4" />
                                                </span>
                                                <span className="text-muted-foreground">{item}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Match Details Summary */}
                            <div className="pt-2 border-t">
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(match.matchDetails).map(([key, value]) => (
                                        <span
                                            key={key}
                                            className={cn(
                                                'px-2 py-1 rounded-full text-xs font-medium',
                                                value
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-muted text-muted-foreground'
                                            )}
                                        >
                                            {key.replace('Match', '')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
