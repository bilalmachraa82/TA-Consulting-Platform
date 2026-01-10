'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Save, Copy, RefreshCw, Check, AlertTriangle, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { CandidaturaSection, CandidaturaSectionState } from '@/lib/ai-writer/sections';

// Compliance result type
interface ComplianceResult {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    message: string;
    foundRequired: number;
    totalRequired: number;
    suggestions: string[];
}

// ============ Section Editor Modal ============

interface SectionEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    section: CandidaturaSection;
    state: CandidaturaSectionState;
    onSave: (content: string) => void;
    onGenerateAI: () => Promise<string>;
    isGenerating?: boolean;
    templateId?: string;
}

export function SectionEditorModal({
    isOpen,
    onClose,
    section,
    state,
    onSave,
    onGenerateAI,
    isGenerating = false,
    templateId = 'pt2030-inovacao',
}: SectionEditorModalProps) {
    const [content, setContent] = useState(state.content || '');
    const [aiSuggestion, setAiSuggestion] = useState(state.aiSuggestion || '');
    const [showingSuggestion, setShowingSuggestion] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [localGenerating, setLocalGenerating] = useState(false);
    const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
    const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);

    // Debounced compliance check
    const checkCompliance = useCallback(async (text: string) => {
        if (text.length < 50) {
            setCompliance(null);
            return;
        }

        setIsCheckingCompliance(true);
        try {
            const response = await fetch('/api/writer/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, templateId }),
            });

            if (response.ok) {
                const data = await response.json();
                setCompliance(data.compliance);
            }
        } catch (error) {
            console.error('Compliance check failed:', error);
        } finally {
            setIsCheckingCompliance(false);
        }
    }, [templateId]);

    // Debounce compliance check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content.length > 50) {
                checkCompliance(content);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content, checkCompliance]);

    useEffect(() => {
        setContent(state.content || '');
        setAiSuggestion(state.aiSuggestion || '');
        setHasChanges(false);
        setCompliance(null);
    }, [state, isOpen]);

    if (!isOpen) return null;

    const handleContentChange = (value: string) => {
        setContent(value);
        setHasChanges(value !== (state.content || ''));
    };

    const handleGenerateAI = async () => {
        setLocalGenerating(true);
        try {
            const suggestion = await onGenerateAI();
            setAiSuggestion(suggestion);
            setShowingSuggestion(true);
        } catch (error) {
            console.error('AI generation failed:', error);
        } finally {
            setLocalGenerating(false);
        }
    };

    const handleUseSuggestion = () => {
        setContent(aiSuggestion);
        setHasChanges(true);
        setShowingSuggestion(false);
    };

    const handleSave = () => {
        onSave(content);
        setHasChanges(false);
        onClose();
    };

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const charCount = content.length;

    // Get compliance badge color
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-100 text-green-700 border-green-200';
            case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'C': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'D': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'F': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const ComplianceIcon = compliance?.score && compliance.score >= 75 ? ShieldCheck :
        compliance?.score && compliance.score >= 50 ? Shield : ShieldAlert;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col m-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                        <p className="text-sm text-slate-500">{section.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Peso: {section.weight}%
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Editor Panel */}
                    <div className={cn(
                        "flex-1 flex flex-col p-6",
                        showingSuggestion && "border-r"
                    )}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-700">Conteúdo</span>
                            <div className="text-xs text-slate-500">
                                {wordCount} palavras • {charCount} caracteres
                            </div>
                        </div>

                        <Textarea
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Escreva o conteúdo desta secção..."
                            className="flex-1 min-h-[400px] resize-none font-mono text-sm"
                        />

                        {/* Validation Hints */}
                        {section.validationHints && section.validationHints.length > 0 && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Pontos de Validação
                                </p>
                                <ul className="text-xs text-amber-600 space-y-1">
                                    {section.validationHints.map((hint, i) => (
                                        <li key={i}>• {hint}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* AI Suggestion Panel */}
                    {showingSuggestion && aiSuggestion && (
                        <div className="w-1/2 flex flex-col p-6 bg-blue-50/50">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-blue-700 flex items-center gap-1">
                                    <Sparkles className="w-4 h-4" />
                                    Sugestão AI
                                </span>
                                <Button size="sm" variant="ghost" onClick={() => setShowingSuggestion(false)}>
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 bg-white rounded-lg border border-blue-200 text-sm whitespace-pre-wrap">
                                {aiSuggestion}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline" onClick={handleUseSuggestion}>
                                    <Copy className="w-3 h-3 mr-1" />
                                    Usar Sugestão
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleGenerateAI} disabled={localGenerating || isGenerating}>
                                    <RefreshCw className={cn("w-3 h-3 mr-1", (localGenerating || isGenerating) && "animate-spin")} />
                                    Regenerar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateAI}
                            disabled={localGenerating || isGenerating}
                        >
                            <Sparkles className={cn("w-4 h-4 mr-1", (localGenerating || isGenerating) && "animate-pulse")} />
                            {localGenerating || isGenerating ? 'A gerar...' : 'Gerar com AI'}
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={!hasChanges && !content}>
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ AI Suggestion Viewer Modal ============

interface AISuggestionViewerProps {
    isOpen: boolean;
    onClose: () => void;
    section: CandidaturaSection;
    suggestion: string;
    onUseSuggestion: (content: string) => void;
    onRegenerate: () => void;
    isRegenerating?: boolean;
}

export function AISuggestionViewer({
    isOpen,
    onClose,
    section,
    suggestion,
    onUseSuggestion,
    onRegenerate,
    isRegenerating = false,
}: AISuggestionViewerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col m-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Sugestão AI</h2>
                            <p className="text-sm text-slate-500">{section.title}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                        {suggestion}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRegenerate}
                        disabled={isRegenerating}
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-1", isRegenerating && "animate-spin")} />
                        {isRegenerating ? 'A regenerar...' : 'Regenerar'}
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Fechar
                        </Button>
                        <Button onClick={() => {
                            onUseSuggestion(suggestion);
                            onClose();
                        }} className="bg-blue-600 hover:bg-blue-700">
                            <Check className="w-4 h-4 mr-1" />
                            Usar Esta Sugestão
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
