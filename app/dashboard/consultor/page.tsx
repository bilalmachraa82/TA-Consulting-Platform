import { ChatInterface } from '@/components/chat/chat-interface';
import { Sparkles } from 'lucide-react';

export const metadata = {
    title: 'Consultor IA - TA Platform',
    description: 'Auditor de elegibilidade e conformidade com IA',
};

export default function ConsultorPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                    Consultor IA
                </h1>
                <p className="text-gray-600 mt-1">
                    Assistente de auditoria conectado a 644 documentos oficiais de fundos europeus.
                </p>
            </div>

            <div className="flex-1 min-h-0">
                <ChatInterface />
            </div>
        </div>
    );
}
