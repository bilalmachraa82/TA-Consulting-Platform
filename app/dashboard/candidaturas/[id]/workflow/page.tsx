'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, FileText, Download, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { WorkflowSectionCard, WorkflowProgress, RequiredDocsChecklist } from '@/components/workflow/section-card';
import { SectionEditorModal, AISuggestionViewer } from '@/components/workflow/modals';
import { getTemplateByProgram, type CandidaturaSection, type CandidaturaSectionState, type SectionStatus } from '@/lib/ai-writer/sections';

// Mock data for demo - in production this comes from API/DB
const MOCK_CANDIDATURA = {
    id: 'demo-001',
    empresaNome: 'TechInova Lda',
    avisoNome: 'SI Inovação Produtiva 2024',
    programId: 'pt2030-inovacao',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date(),
};

export default function CandidaturaWorkflowPage() {
    const params = useParams();
    const candidaturaId = params?.id as string || 'demo-001';

    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [sectionStates, setSectionStates] = useState<CandidaturaSectionState[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal states
    const [editorModalOpen, setEditorModalOpen] = useState(false);
    const [suggestionViewerOpen, setSuggestionViewerOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<CandidaturaSection | null>(null);
    const [activeState, setActiveState] = useState<CandidaturaSectionState | null>(null);

    const template = getTemplateByProgram(MOCK_CANDIDATURA.programId);

    // Initialize section states
    useEffect(() => {
        if (template) {
            const initialStates: CandidaturaSectionState[] = template.sections.map((section, i) => ({
                sectionId: section.id,
                status: i === 0 ? 'draft' : 'pending' as SectionStatus,
                content: i === 0 ? 'Rascunho inicial da caracterização da empresa...' : '',
                aiSuggestion: i === 1 ? 'Sugestão AI para descrição do projeto baseada em candidaturas similares aprovadas...' : undefined,
            }));
            setSectionStates(initialStates);
            setActiveSectionId(template.sections[0]?.id || null);
        }
    }, [template]);

    if (!template) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Template não encontrado</p>
            </div>
        );
    }

    // Generate AI content via API
    const handleGenerateAI = async (sectionId: string): Promise<string> => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/writer/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: MOCK_CANDIDATURA.programId,
                    sectionId,
                    empresaId: null, // In production: actual empresa ID
                    avisoId: null, // In production: actual aviso ID
                    customContext: {
                        projeto: {
                            nome: 'Projeto de Digitalização',
                            descricao: 'Implementação de soluções digitais para otimização de processos',
                        },
                        notes: 'Foco em inovação e sustentabilidade',
                    },
                }),
            });

            const data = await response.json();

            if (data.success && data.content) {
                setSectionStates(prev => prev.map(s =>
                    s.sectionId === sectionId
                        ? { ...s, aiSuggestion: data.content, status: 'draft' as SectionStatus }
                        : s
                ));
                return data.content;
            } else {
                // Fallback to mock if API fails
                const mockContent = `[Demo] Conteúdo gerado para ${sectionId}. Em produção, isto viria da API com base em candidaturas aprovadas similares e nos critérios do aviso.`;
                setSectionStates(prev => prev.map(s =>
                    s.sectionId === sectionId
                        ? { ...s, aiSuggestion: mockContent, status: 'draft' as SectionStatus }
                        : s
                ));
                return mockContent;
            }
        } catch (error) {
            console.error('AI generation error:', error);
            const fallback = 'Erro ao gerar conteúdo. Por favor tente novamente.';
            return fallback;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApprove = (sectionId: string) => {
        setSectionStates(prev => prev.map(s =>
            s.sectionId === sectionId
                ? { ...s, status: 'approved' as SectionStatus, approvedBy: 'Consultor', approvedAt: new Date() }
                : s
        ));

        // Auto-advance to next section
        const currentIndex = template.sections.findIndex(s => s.id === sectionId);
        if (currentIndex < template.sections.length - 1) {
            setActiveSectionId(template.sections[currentIndex + 1].id);
        }
    };

    const handleEdit = (sectionId: string) => {
        const section = template.sections.find(s => s.id === sectionId);
        const state = sectionStates.find(s => s.sectionId === sectionId);
        if (section && state) {
            setActiveSection(section);
            setActiveState(state);
            setEditorModalOpen(true);
        }
    };

    const handleViewSuggestion = (sectionId: string) => {
        const section = template.sections.find(s => s.id === sectionId);
        const state = sectionStates.find(s => s.sectionId === sectionId);
        if (section && state) {
            setActiveSection(section);
            setActiveState(state);
            setSuggestionViewerOpen(true);
        }
    };

    const handleSaveContent = (content: string) => {
        if (activeSection) {
            setSectionStates(prev => prev.map(s =>
                s.sectionId === activeSection.id
                    ? { ...s, content, status: 'draft' as SectionStatus }
                    : s
            ));
        }
    };

    const handleUseSuggestion = (content: string) => {
        if (activeSection) {
            setSectionStates(prev => prev.map(s =>
                s.sectionId === activeSection.id
                    ? { ...s, content, status: 'draft' as SectionStatus }
                    : s
            ));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/candidaturas">
                                <Button variant="ghost" size="sm">
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Voltar
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-900">{MOCK_CANDIDATURA.empresaNome}</h1>
                                <p className="text-sm text-slate-500">{MOCK_CANDIDATURA.avisoNome}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {template.name}
                            </Badge>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Exportar
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Send className="w-4 h-4 mr-1" />
                                Submeter
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress */}
                        <Card>
                            <CardContent className="pt-6">
                                <WorkflowProgress template={template} states={sectionStates} />
                            </CardContent>
                        </Card>

                        {/* Sections Workflow */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Secções da Candidatura</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {template.sections.map((section) => {
                                    const state = sectionStates.find(s => s.sectionId === section.id) || {
                                        sectionId: section.id,
                                        status: 'pending' as SectionStatus,
                                        content: '',
                                    };

                                    return (
                                        <div
                                            key={section.id}
                                            onClick={() => setActiveSectionId(section.id)}
                                            className="cursor-pointer"
                                        >
                                            <WorkflowSectionCard
                                                section={section}
                                                state={state}
                                                isActive={activeSectionId === section.id}
                                                onGenerateAI={() => handleGenerateAI(section.id)}
                                                onEdit={() => handleEdit(section.id)}
                                                onApprove={() => handleApprove(section.id)}
                                                onViewSuggestion={() => handleViewSuggestion(section.id)}
                                                isGenerating={isGenerating}
                                            />
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Informação
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Programa</span>
                                    <span className="font-medium">{template.portal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Criada</span>
                                    <span>{MOCK_CANDIDATURA.createdAt.toLocaleDateString('pt-PT')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Última atualização</span>
                                    <span>{MOCK_CANDIDATURA.updatedAt.toLocaleDateString('pt-PT')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Required Docs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">📎 Documentação</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RequiredDocsChecklist
                                    docs={template.requiredDocs}
                                    uploadedDocs={['Certidão Permanente']}
                                />
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-base text-blue-700">💡 Dica</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-blue-600">
                                <p>
                                    Clique em "Gerar com AI" para obter uma sugestão baseada em candidaturas aprovadas similares.
                                    Reveja sempre o conteúdo antes de aprovar.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Section Editor Modal */}
            {activeSection && activeState && (
                <SectionEditorModal
                    isOpen={editorModalOpen}
                    onClose={() => setEditorModalOpen(false)}
                    section={activeSection}
                    state={activeState}
                    onSave={handleSaveContent}
                    onGenerateAI={async () => {
                        const content = await handleGenerateAI(activeSection.id);
                        return content;
                    }}
                    isGenerating={isGenerating}
                />
            )}

            {/* AI Suggestion Viewer */}
            {activeSection && activeState && (
                <AISuggestionViewer
                    isOpen={suggestionViewerOpen}
                    onClose={() => setSuggestionViewerOpen(false)}
                    section={activeSection}
                    suggestion={activeState.aiSuggestion || ''}
                    onUseSuggestion={handleUseSuggestion}
                    onRegenerate={() => handleGenerateAI(activeSection.id)}
                    isRegenerating={isGenerating}
                />
            )}
        </div>
    );
}
