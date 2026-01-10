'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, AlertCircle, Loader2, FileSearch, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { CitationCard } from './citation-card';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Array<{ source?: string; title?: string; uri?: string }>;
    readinessScore?: number;
    confidenceLevel?: number;
    timestamp: Date;
    isError?: boolean;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Olá! Sou o Auditor IA da TA Platform. 🛡️\n\nEstou ligado diretamente à base de dados oficial dos fundos europeus (PRR, PT2030, etc.).\n\n**O que queres verificar hoje?**\nEx: "A minha empresa de turismo é elegível para o aviso da descarbonização?"',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [portal, setPortal] = useState<string>('ALL');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/rag/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userMsg.content,
                    portal: portal === 'ALL' ? undefined : portal,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro desconhecido');
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                citations: data.citations,
                readinessScore: data.readinessScore,
                confidenceLevel: data.confidenceLevel,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `❌ **Erro:** ${error.message || 'Não foi possível processar o pedido.'}`,
                timestamp: new Date(),
                isError: true,
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
            {/* Header / Controls */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                        <FileSearch className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Auditor IA</h2>
                        <div className="flex items-center text-xs text-green-600 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                            Conectado ao File Search Store (529 Docs)
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 hidden md:flex items-center gap-1"
                        onClick={() => {
                            // Synergy Feature: Request Human Review
                            toast.success('Pedido de revisão humana enviado!', {
                                description: 'Um consultor sénior validará esta análise nas próximas 2h.'
                            })
                        }}
                    >
                        <Users className="w-3 h-3" />
                        Solicitar Validação Humana
                    </Button>

                    <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

                    {['ALL', 'PRR', 'PT2030', 'HORIZON'].map((p) => (
                        <Button
                            key={p}
                            variant={portal === p ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPortal(p)}
                            className="text-xs"
                        >
                            {p === 'ALL' ? 'Todos' : p}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden flex flex-col shadow-xl border-t-4 border-t-blue-600">
                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="space-y-6 pb-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user'
                                    ? 'bg-gray-200'
                                    : msg.isError ? 'bg-red-100 text-red-600' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-6 h-6 text-gray-600" /> : msg.isError ? <AlertCircle className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                                </div>

                                {/* Bubble */}
                                <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : msg.isError
                                            ? 'bg-red-50 border border-red-200 text-red-900 rounded-tl-sm'
                                            : 'bg-white border-2 border-slate-100 text-slate-800 rounded-tl-sm'
                                        }`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>

                                    {/* Metadata / Citations */}
                                    <div className="mt-1">
                                        {/* Readiness Score Badge */}
                                        {msg.role === 'assistant' && msg.readinessScore !== undefined && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs font-bold shadow-sm mr-2 mb-2">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>Readiness: {msg.readinessScore}%</span>
                                            </div>
                                        )}

                                        {/* Confidence Badge */}
                                        {msg.role === 'assistant' && !msg.isError && msg.confidenceLevel !== undefined && (
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm mb-2 ${msg.confidenceLevel >= 0.8
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                : msg.confidenceLevel >= 0.5
                                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                                                    : 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
                                                }`}>
                                                <FileSearch className="w-3 h-3" />
                                                <span>Confiança: {Math.round(msg.confidenceLevel * 100)}%</span>
                                            </div>
                                        )}

                                        {msg.role === 'assistant' && !msg.isError && msg.citations && msg.citations.length > 0 && (
                                            <div className="ml-2">
                                                <CitationCard citations={msg.citations} />
                                            </div>
                                        )}

                                        <span className="text-xs text-slate-400 mt-1 block px-1">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                                <div className="bg-white border-2 border-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                                    <span className="text-sm text-slate-500 font-medium">A analisar regulamentos oficiais...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-slate-50 border-t flex gap-3 items-end">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Faça uma pergunta sobre elegibilidade, prazos ou regras..."
                        className="min-h-[50px] py-3 bg-white shadow-sm border-slate-200 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="h-[50px] w-[50px] rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </Card>

            {/* Disclaimer */}
            <div className="mt-3 text-center">
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    O Auditor IA baseia-se em documentos oficiais, mas não substitui a validação humana final para submissão.
                </p>
            </div>
        </div>
    );
}
