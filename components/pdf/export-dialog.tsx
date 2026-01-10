'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Loader2, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PDFExportDialogProps {
    entityId: string;
    entityType: 'empresa' | 'candidatura';
    entityName: string;
    trigger?: React.ReactNode;
}

type TemplateOption = {
    id: string;
    label: string;
    description: string;
    pages: string;
};

const TEMPLATES_BY_TYPE: Record<string, TemplateOption[]> = {
    empresa: [
        { id: 'elegibilidade', label: 'Relatório de Elegibilidade', description: 'Análise completa de oportunidades', pages: '2-3' },
    ],
    candidatura: [
        { id: 'resumo-executivo', label: 'Resumo Executivo', description: 'Visão geral para stakeholders', pages: '1-2' },
        { id: 'candidatura', label: 'Candidatura Completa', description: 'Documento oficial de submissão', pages: '10+' },
    ],
};

export function PDFExportDialog({ entityId, entityType, entityName, trigger }: PDFExportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const templates = TEMPLATES_BY_TYPE[entityType] || [];

    const handleGenerate = async () => {
        if (!selectedTemplate) {
            toast.error('Seleciona um template');
            return;
        }

        setIsGenerating(true);
        setIsSuccess(false);

        try {
            const response = await fetch('/api/pdf/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateType: selectedTemplate,
                    entityId,
                    options: {
                        includeFooter: true,
                        includePageNumbers: true,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Falha na geração do PDF');
            }

            // Download the PDF
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedTemplate}-${entityName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setIsSuccess(true);
            toast.success('PDF gerado e transferido!');

            // Auto-close after success
            setTimeout(() => {
                setIsOpen(false);
                setIsSuccess(false);
                setSelectedTemplate('');
            }, 1500);

        } catch (error) {
            console.error('PDF Error:', error);
            toast.error('Erro ao gerar PDF. Tenta novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Exportar PDF
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Exportar Relatório PDF
                    </DialogTitle>
                    <DialogDescription>
                        Gera um documento profissional para <strong>{entityName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Template Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tipo de Relatório</label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Escolhe um template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        <div className="flex flex-col">
                                            <span>{template.label}</span>
                                            <span className="text-xs text-gray-500">
                                                {template.description} • {template.pages} páginas
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Preview Info */}
                    {selectedTemplate && (
                        <div className="rounded-lg bg-blue-50 p-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">Pré-visualização</p>
                                    <p className="text-blue-700 text-xs">
                                        O PDF incluirá branding TA Consulting, cabeçalho profissional e numeração de páginas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!selectedTemplate || isGenerating}
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                A gerar...
                            </>
                        ) : isSuccess ? (
                            <>
                                <Check className="h-4 w-4" />
                                Concluído!
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Gerar e Transferir
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
