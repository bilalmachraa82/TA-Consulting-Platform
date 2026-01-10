'use client';

import { useState } from 'react';
import { Check, Circle, Clock, AlertCircle, ChevronRight, Sparkles, Edit3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import type { CandidaturaSection, ProgramTemplate, SectionStatus, CandidaturaSectionState } from '@/lib/ai-writer/sections';

interface WorkflowSectionCardProps {
    section: CandidaturaSection;
    state: CandidaturaSectionState;
    isActive: boolean;
    onGenerateAI: () => void;
    onEdit: () => void;
    onApprove: () => void;
    onViewSuggestion: () => void;
    isGenerating?: boolean;
}

const STATUS_CONFIG: Record<SectionStatus, { icon: React.ReactNode; color: string; label: string }> = {
    pending: { icon: <Circle className="w-4 h-4" />, color: 'text-slate-400', label: 'Pendente' },
    draft: { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-500', label: 'Rascunho' },
    review: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-blue-500', label: 'Em Revisão' },
    approved: { icon: <Check className="w-4 h-4" />, color: 'text-green-500', label: 'Aprovado' },
    rejected: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-500', label: 'Rejeitado' },
};

export function WorkflowSectionCard({
    section,
    state,
    isActive,
    onGenerateAI,
    onEdit,
    onApprove,
    onViewSuggestion,
    isGenerating = false,
}: WorkflowSectionCardProps) {
    const statusConfig = STATUS_CONFIG[state.status];
    const hasAISuggestion = !!state.aiSuggestion;
    const hasContent = !!state.content && state.content.length > 0;

    return (
        <Card className={cn(
            'transition-all duration-200',
            isActive ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200',
            state.status === 'approved' && 'bg-green-50/50 border-green-200'
        )}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn('rounded-full p-1.5', statusConfig.color)}>
                            {statusConfig.icon}
                        </div>
                        <div>
                            <CardTitle className="text-base">{section.title}</CardTitle>
                            <CardDescription className="text-sm">{section.description}</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', statusConfig.color)}>
                        {statusConfig.label} • {section.weight}%
                    </Badge>
                </div>
            </CardHeader>

            {isActive && (
                <CardContent className="pt-2 space-y-4">
                    {/* Validation Hints */}
                    {section.validationHints && section.validationHints.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-amber-700 mb-2">📋 Pontos de Validação:</p>
                            <ul className="text-xs text-amber-600 space-y-1">
                                {section.validationHints.map((hint, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        {hint}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Content Preview */}
                    {hasContent && (
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Conteúdo atual:</p>
                            <p className="text-sm text-slate-700 line-clamp-3">{state.content}</p>
                        </div>
                    )}

                    {/* AI Suggestion Available */}
                    {hasAISuggestion && !hasContent && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-blue-500" />
                                <p className="text-xs font-medium text-blue-700">Sugestão AI disponível</p>
                            </div>
                            <p className="text-sm text-blue-600 line-clamp-2">{state.aiSuggestion}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                        {!hasContent && !hasAISuggestion && (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={onGenerateAI}
                                disabled={isGenerating}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                            >
                                <Sparkles className="w-3 h-3 mr-1" />
                                {isGenerating ? 'A gerar...' : 'Gerar com AI'}
                            </Button>
                        )}

                        {hasAISuggestion && (
                            <Button size="sm" variant="outline" onClick={onViewSuggestion}>
                                <Eye className="w-3 h-3 mr-1" />
                                Ver Sugestão
                            </Button>
                        )}

                        <Button size="sm" variant="outline" onClick={onEdit}>
                            <Edit3 className="w-3 h-3 mr-1" />
                            {hasContent ? 'Editar' : 'Escrever'}
                        </Button>

                        {hasContent && state.status !== 'approved' && (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={onApprove}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Aprovar
                            </Button>
                        )}
                    </div>

                    {/* Approved By */}
                    {state.status === 'approved' && state.approvedBy && (
                        <p className="text-xs text-green-600">
                            ✓ Aprovado por {state.approvedBy} em {state.approvedAt?.toLocaleDateString('pt-PT')}
                        </p>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// ============ Workflow Progress Bar ============

interface WorkflowProgressProps {
    template: ProgramTemplate;
    states: CandidaturaSectionState[];
}

export function WorkflowProgress({ template, states }: WorkflowProgressProps) {
    const approvedWeight = states
        .filter(s => s.status === 'approved')
        .reduce((sum, s) => {
            const section = template.sections.find(sec => sec.id === s.sectionId);
            return sum + (section?.weight || 0);
        }, 0);

    const draftWeight = states
        .filter(s => s.status === 'draft' || s.status === 'review')
        .reduce((sum, s) => {
            const section = template.sections.find(sec => sec.id === s.sectionId);
            return sum + (section?.weight || 0);
        }, 0);

    const progress = Math.round((approvedWeight / template.totalWeight) * 100);
    const partialProgress = Math.round(((approvedWeight + draftWeight) / template.totalWeight) * 100);

    const approvedCount = states.filter(s => s.status === 'approved').length;
    const totalCount = template.sections.length;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Progresso da Candidatura</span>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">{progress}%</span>
                    <Badge variant="outline" className="text-xs">
                        {approvedCount}/{totalCount} secções
                    </Badge>
                </div>
            </div>

            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                {/* Partial progress (drafts) */}
                <div
                    className="absolute inset-y-0 left-0 bg-blue-200 transition-all duration-500"
                    style={{ width: `${partialProgress}%` }}
                />
                {/* Approved progress */}
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Aprovado ({approvedWeight}%)
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-200" />
                    Em progresso ({draftWeight}%)
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-100" />
                    Pendente ({template.totalWeight - approvedWeight - draftWeight}%)
                </div>
            </div>
        </div>
    );
}

// ============ Required Documents Checklist ============

interface RequiredDocsChecklistProps {
    docs: string[];
    uploadedDocs?: string[];
}

export function RequiredDocsChecklist({ docs, uploadedDocs = [] }: RequiredDocsChecklistProps) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Documentação Obrigatória</p>
            <div className="space-y-1">
                {docs.map((doc, i) => {
                    const isUploaded = uploadedDocs.includes(doc);
                    return (
                        <div
                            key={i}
                            className={cn(
                                'flex items-center gap-2 text-sm py-1 px-2 rounded',
                                isUploaded ? 'text-green-700 bg-green-50' : 'text-slate-600'
                            )}
                        >
                            {isUploaded ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Circle className="w-4 h-4 text-slate-300" />
                            )}
                            {doc}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
