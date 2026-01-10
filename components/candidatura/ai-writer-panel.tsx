
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Copy, Check, ChevronRight, Wand2 } from 'lucide-react';
import { CANDIDATURA_SECTIONS } from '@/lib/ai-writer/sections';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';


interface AIWriterPanelProps {
    empresaId: string;
    avisoId: string;
    onApplyContent: (content: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function AIWriterPanel({ empresaId, avisoId, onApplyContent, isOpen, onClose }: AIWriterPanelProps) {
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [instructions, setInstructions] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!selectedSection) return;
        setIsGenerating(true);
        setGeneratedContent(''); // Reset anterior

        try {
            const response = await fetch('/api/writer/candidatura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionId: selectedSection,
                    empresaId,
                    avisoId,
                    userInstructions: instructions
                })
            });

            if (!response.ok) throw new Error('Falha na geração');
            if (!response.body) throw new Error('Stream não disponível');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                setGeneratedContent(fullText);
            }

            toast.success('Conteúdo gerado com sucesso!');
        } catch (error) {
            console.error('Generation Error:', error);
            toast.error('Erro ao gerar conteúdo assistido por IA');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentSection = CANDIDATURA_SECTIONS.find(s => s.id === selectedSection);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 flex flex-col border-l animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">AI Writer Assistant</h2>
                        <p className="text-xs text-gray-500">Powered by Claude 4.5</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {/* Section Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">O que queres escrever?</label>
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleciona uma secção..." />
                            </SelectTrigger>
                            <SelectContent>
                                {CANDIDATURA_SECTIONS.map(section => (
                                    <SelectItem key={section.id} value={section.id}>
                                        {section.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentSection && (
                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                💡 {currentSection.description}
                            </p>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Instruções Adicionais (Opcional)</label>
                        <Textarea
                            placeholder="Ex: Foca mais na componente de exportação para Espanha..."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={!selectedSection || isGenerating}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                A analisar documentos...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Gerar Conteúdo Premium
                            </>
                        )}
                    </Button>

                    {/* Output Area */}
                    {(generatedContent || isGenerating) && (
                        <Card className="border-purple-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-purple-50/50 py-3 px-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium text-purple-900">
                                    Conteúdo Gerado
                                </CardTitle>
                                <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 bg-gray-50/50 min-h-[200px] text-sm leading-relaxed text-gray-800">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-3 py-10 opacity-70">
                                        <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                                        <p className="text-xs text-gray-500">A escrever secção '{currentSection?.title}'...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3">
                                        <ReactMarkdown>{generatedContent}</ReactMarkdown>
                                    </div>
                                )}
                            </CardContent>
                            {generatedContent && (
                                <div className="p-3 bg-white border-t flex justify-end">
                                    <Button
                                        onClick={() => onApplyContent(generatedContent)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Usar este texto
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}

                    {generatedContent && (
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                            <Badge variant="outline" className="text-xs font-normal border-purple-200 bg-purple-50 text-purple-700">
                                Claude Sonnet 4.5
                            </Badge>
                            <span>•</span>
                            <span>via OpenRouter</span>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
