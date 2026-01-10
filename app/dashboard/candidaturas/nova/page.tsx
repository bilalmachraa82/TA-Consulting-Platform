'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Sparkles,
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Save,
    Download,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { AI_MODELS } from '@/lib/openrouter';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TemplateSection {
    id: string;
    title: string;
    description: string;
    placeholder: string;
    maxLength: number;
    required: boolean;
    order: number;
}

interface Template {
    id: string;
    name: string;
    portal: string;
    description: string;
    sections: TemplateSection[];
}

export default function NovaCandidaturaPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState(1);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [avisos, setAvisos] = useState<any[]>([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [selectedAviso, setSelectedAviso] = useState<string>('');
    const [sectionContents, setSectionContents] = useState<Record<string, string>>({});
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [selectedModel, setSelectedModel] = useState('claude-4-5-sonnet');
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load initial data
    useEffect(() => {
        loadTemplates();
        loadEmpresas();
        loadAvisos();
    }, []);

    const loadTemplates = async () => {
        try {
            const res = await fetch('/api/writer/generate');
            const data = await res.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const loadEmpresas = async () => {
        try {
            const res = await fetch('/api/empresas');
            const data = await res.json();
            setEmpresas(data || []);
        } catch (error) {
            console.error('Error loading empresas:', error);
        }
    };

    const loadAvisos = async () => {
        try {
            const res = await fetch('/api/avisos?limit=50&ativo=true');
            const data = await res.json();
            setAvisos(data.avisos || []);
        } catch (error) {
            console.error('Error loading avisos:', error);
        }
    };

    const handleSelectTemplate = async (templateId: string) => {
        try {
            const res = await fetch(`/api/writer/generate`);
            const data = await res.json();
            // For now, use mock full template
            const template = {
                id: templateId,
                name: templateId === 'pt2030-inovacao' ? 'SI Inovação Produtiva' : 'Transição Digital',
                portal: templateId.includes('pt2030') ? 'PT2030' : 'PRR',
                description: 'Template de candidatura',
                sections: [
                    { id: 'resumo', title: 'Resumo do Projeto', description: 'Síntese executiva', placeholder: 'Descreva o projeto...', maxLength: 3000, required: true, order: 1 },
                    { id: 'caracterizacao', title: 'Caracterização da Empresa', description: 'Apresentação do promotor', placeholder: 'Descreva a empresa...', maxLength: 5000, required: true, order: 2 },
                    { id: 'inovacao', title: 'Componente de Inovação', description: 'Descrição da inovação', placeholder: 'Explique a inovação...', maxLength: 6000, required: true, order: 3 },
                    { id: 'impacto', title: 'Impacto Económico', description: 'Resultados esperados', placeholder: 'Quantifique os impactos...', maxLength: 4000, required: true, order: 4 },
                ]
            };
            setSelectedTemplate(template);
            setStep(2);
        } catch (error) {
            toast.error('Erro ao carregar template');
        }
    };

    const generateSectionContent = async () => {
        if (!selectedTemplate) return;

        const section = selectedTemplate.sections[currentSectionIndex];
        setGenerating(true);

        try {
            const res = await fetch('/api/writer/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: selectedTemplate.id,
                    sectionId: section.id,
                    empresaId: selectedEmpresa || undefined,
                    avisoId: selectedAviso || undefined,
                    modelId: selectedModel,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSectionContents(prev => ({
                    ...prev,
                    [section.id]: data.content
                }));
                toast.success('Conteúdo gerado com sucesso!');
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao gerar conteúdo');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save as draft candidatura
            const res = await fetch('/api/candidaturas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empresaId: selectedEmpresa,
                    avisoId: selectedAviso,
                    observacoes: JSON.stringify({
                        templateId: selectedTemplate?.id,
                        sections: sectionContents,
                    }),
                }),
            });

            if (res.ok) {
                toast.success('Candidatura guardada!');
                router.push('/dashboard/candidaturas');
            } else {
                throw new Error('Erro ao guardar');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleExportPDF = () => {
        if (!selectedTemplate) return;

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text(selectedTemplate.name, 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Gerado por TA Consulting Platform - ${new Date().toLocaleDateString()}`, 20, 30);

            // Context Info
            if (selectedEmpresa) {
                const empresa = empresas.find(e => e.id === selectedEmpresa);
                if (empresa) {
                    doc.text(`Empresa: ${empresa.nome}`, 20, 40);
                }
            }

            let yPos = 50;

            // Sections
            selectedTemplate.sections.forEach((section, index) => {
                // Section Title
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(`${index + 1}. ${section.title}`, 20, yPos);
                yPos += 10;

                // Section Content
                const content = sectionContents[section.id] || 'Conteúdo não gerado.';

                // Use autoTable for better text wrapping and handling
                autoTable(doc, {
                    startY: yPos,
                    head: [],
                    body: [[content]],
                    theme: 'plain',
                    styles: {
                        fontSize: 11,
                        cellPadding: 0,
                        overflow: 'linebreak',
                        font: 'helvetica'
                    },
                    margin: { left: 20, right: 20 },
                    didDrawPage: (data) => {
                        // Footer or Header for new pages could go here
                    }
                });

                // Update yPos for next section based on where the table ended
                // @ts-ignore - autoTable adds lastAutoTable to doc
                yPos = doc.lastAutoTable.finalY + 20;

                // Add new page if not enough space for next title (approx check)
                if (yPos > 250 && index < selectedTemplate.sections.length - 1) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            doc.save(`candidatura-${selectedTemplate.id}.pdf`);
            toast.success('PDF exportado com sucesso!');

        } catch (error) {
            console.error('PDF Export Error:', error);
            toast.error('Erro ao exportar PDF');
        }
    };

    const progress = selectedTemplate
        ? (Object.keys(sectionContents).length / selectedTemplate.sections.length) * 100
        : 0;

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
    }

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-purple-500" />
                        AI Writer
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerar candidaturas com apoio de IA
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    Beta
                </Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Step 1: Select Template */}
            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">1. Escolher Template</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card
                            className="cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => handleSelectTemplate('pt2030-inovacao')}
                        >
                            <CardHeader>
                                <Badge className="w-fit mb-2">PT2030</Badge>
                                <CardTitle>SI Inovação Produtiva</CardTitle>
                                <CardDescription>
                                    Template para projetos de inovação e modernização
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    6 secções • Até €25M • Taxa 45-75%
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:border-green-500 transition-colors"
                            onClick={() => handleSelectTemplate('prr-digital')}
                        >
                            <CardHeader>
                                <Badge variant="secondary" className="w-fit mb-2">PRR</Badge>
                                <CardTitle>Transição Digital</CardTitle>
                                <CardDescription>
                                    Template para projetos de digitalização
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    3 secções • Até €1M • Taxa 75%
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Step 2: Select Context */}
            {step === 2 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">2. Contexto da Candidatura</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Empresa</label>
                            <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecionar empresa..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {empresas.map(e => (
                                        <SelectItem key={e.id} value={e.id}>
                                            {e.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Aviso</label>
                            <Select value={selectedAviso} onValueChange={setSelectedAviso}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecionar aviso..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {avisos.map(a => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.nome?.substring(0, 50)}...
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={() => setStep(3)} className="w-full">
                        Continuar para Escrita
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            {/* Step 3: AI Writing */}
            {step === 3 && selectedTemplate && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">3. Escrita com IA</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Guardar
                            </Button>
                            <Button variant="secondary" onClick={handleExportPDF}>
                                <Download className="w-4 h-4 mr-2" />
                                Exportar PDF
                            </Button>
                        </div>
                    </div>

                    {/* Section Navigation */}
                    <Tabs
                        value={selectedTemplate.sections[currentSectionIndex].id}
                        onValueChange={(v) => {
                            const idx = selectedTemplate.sections.findIndex(s => s.id === v);
                            if (idx >= 0) setCurrentSectionIndex(idx);
                        }}
                    >
                        <TabsList className="flex-wrap h-auto">
                            {selectedTemplate.sections.map((section, idx) => (
                                <TabsTrigger
                                    key={section.id}
                                    value={section.id}
                                    className="flex items-center gap-1"
                                >
                                    {sectionContents[section.id] ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3 text-muted-foreground" />
                                    )}
                                    {section.title}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {selectedTemplate.sections.map((section) => (
                            <TabsContent key={section.id} value={section.id} className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{section.title}</CardTitle>
                                                <CardDescription>{section.description}</CardDescription>
                                            </div>
                                            <div className="flex gap-3 items-center">
                                                <Select value={selectedModel} onValueChange={setSelectedModel}>
                                                    <SelectTrigger className="w-[200px]">
                                                        <SelectValue placeholder="Modelo IA" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(AI_MODELS).map(([key, model]) => (
                                                            <SelectItem key={key} value={key}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium flex items-center gap-2">
                                                                        {model.name}
                                                                        {model.premium && <Badge variant="secondary" className="text-[10px] h-4">Premium</Badge>}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">{model.description}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    onClick={generateSectionContent}
                                                    disabled={generating}
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                >
                                                    {generating ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                    )}
                                                    Gerar
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={sectionContents[section.id] || ''}
                                            onChange={(e) => setSectionContents(prev => ({
                                                ...prev,
                                                [section.id]: e.target.value
                                            }))}
                                            placeholder={section.placeholder}
                                            className="min-h-[300px] font-mono text-sm"
                                        />
                                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                            <span>
                                                {(sectionContents[section.id] || '').length} / {section.maxLength} caracteres
                                            </span>
                                            {section.required && (
                                                <span className="text-red-500">* Obrigatório</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                            disabled={currentSectionIndex === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Secção Anterior
                        </Button>
                        <Button
                            onClick={() => setCurrentSectionIndex(Math.min(selectedTemplate.sections.length - 1, currentSectionIndex + 1))}
                            disabled={currentSectionIndex === selectedTemplate.sections.length - 1}
                        >
                            Próxima Secção
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
