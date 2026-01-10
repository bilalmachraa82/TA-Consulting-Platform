import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Citation {
    source?: string;
    title?: string;
    uri?: string;
}

interface CitationCardProps {
    citations: Citation[];
}

export function CitationCard({ citations }: CitationCardProps) {
    if (!citations || citations.length === 0) return null;

    return (
        <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                Fontes Oficiais
            </h4>
            <div className="grid grid-cols-1 gap-2">
                {citations.map((citation, index) => {
                    // Clean up the title/source for display
                    // Example: "PRR__01-C06-i07_2023__Impulso-Digital" -> "Aviso 01-C06-i07 (Impulso Digital)"
                    const displayText = citation.title
                        ? citation.title.replace(/__/g, ' - ').replace(/_/g, ' ')
                        : `Documento de Referência ${index + 1}`;

                    const isPDF = citation.uri?.toLowerCase().endsWith('.pdf') || citation.title?.toLowerCase().includes('.pdf');

                    return (
                        <Card key={index} className="bg-blue-50/50 border-blue-100 hover:border-blue-300 transition-colors group cursor-pointer">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-blue-900 truncate" title={displayText}>
                                            {displayText}
                                        </p>
                                        {citation.source && (
                                            <p className="text-xs text-blue-700 truncate">
                                                {citation.source}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {citation.uri && (
                                    <a
                                        href={citation.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 p-1.5 hover:bg-blue-200 rounded-full text-blue-600 transition-colors"
                                        title="Abrir documento original"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
