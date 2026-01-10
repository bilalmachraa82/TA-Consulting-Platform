'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface MatchResult {
    avisoId: string;
    avisoNome: string;
    portal: string;
    link?: string;
    taxa?: string;
    diasRestantes: number;
    score: number;
    confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
    reasons: string[];
    missing: string[];
}

interface ResultCardProps {
    match: MatchResult;
    rank: number;
}

export default function ResultCard({ match, rank }: ResultCardProps) {
    const [expanded, setExpanded] = React.useState(rank === 1);

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'ALTA': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'MEDIA': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'BAIXA': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const getPortalColor = (portal: string) => {
        switch (portal) {
            case 'PORTUGAL2030': return 'bg-blue-500/20 text-blue-400';
            case 'PRR': return 'bg-teal-500/20 text-teal-400';
            case 'PEPAC': return 'bg-green-500/20 text-green-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const getUrgencyStyle = (dias: number) => {
        if (dias <= 14) return 'text-red-400';
        if (dias <= 30) return 'text-yellow-400';
        return 'text-slate-400';
    };

    return (
        <Card className={`border-0 shadow-lg bg-card/95 backdrop-blur-xl transition-all ${rank === 1 ? 'ring-2 ring-primary/50 shadow-[0_0_25px_-5px_hsl(var(--primary)/0.3)]' : ''}`}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? 'bg-gradient-to-br from-primary to-cyan-500 text-white shadow-[0_0_10px_-2px_hsl(var(--primary)/0.5)]' : 'bg-muted text-muted-foreground'}`}>
                            {rank}
                        </div>
                        <div>
                            <CardTitle className="text-lg text-white leading-tight">{match.avisoNome}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={getPortalColor(match.portal)}>{match.portal}</Badge>
                                <Badge className={getConfidenceColor(match.confidence)}>
                                    Confiança {match.confidence}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        {match.taxa && (
                            <div className="text-2xl font-bold text-green-400">{match.taxa}</div>
                        )}
                        <div className={`text-sm flex items-center gap-1 ${getUrgencyStyle(match.diasRestantes)}`}>
                            <Clock className="w-3 h-3" />
                            {match.diasRestantes} dias restantes
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Score Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Compatibilidade</span>
                        <span>{match.score}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${match.score}%` }}
                        />
                    </div>
                </div>

                {/* Reasons - Always Visible */}
                <div className="space-y-2">
                    {match.reasons.slice(0, 3).map((reason, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>{reason}</span>
                        </div>
                    ))}
                </div>

                {/* Expandable Section */}
                {expanded && (
                    <div className="space-y-4 pt-2 border-t border-slate-700">
                        {/* Missing Fields */}
                        {match.missing.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">A confirmar</p>
                                {match.missing.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-400">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex gap-2">
                            {match.link && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                                    asChild
                                >
                                    <a href={match.link} target="_blank" rel="noopener noreferrer">
                                        Ver Aviso Oficial <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-primary to-cyan-500 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)]"
                            >
                                Agendar Consulta
                            </Button>
                        </div>
                    </div>
                )}

                {/* Expand Toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full text-center text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-1"
                >
                    {expanded ? (
                        <>Menos detalhes <ChevronUp className="w-4 h-4" /></>
                    ) : (
                        <>Mais detalhes <ChevronDown className="w-4 h-4" /></>
                    )}
                </button>
            </CardContent>
        </Card>
    );
}
