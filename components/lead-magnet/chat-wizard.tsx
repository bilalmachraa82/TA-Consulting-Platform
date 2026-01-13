'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bot, Send, Sparkles, AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    actions?: MessageAction[];
}

interface MessageAction {
    label: string;
    value: string;
    icon?: 'confirm' | 'reject';
}

interface ExtractedData {
    nome_empresa?: string;
    nif?: string;
    setor?: string;
    regiao?: string;
    email?: string;
}

interface CompanyFound {
    nif?: string;
    nome?: string;
    morada?: string;
    setor?: string;
    confianca?: string;
}

interface ChatResponse {
    message: string;
    extracted?: ExtractedData;
    company_found?: CompanyFound;
    missing?: string[];
    complete?: boolean;
    action?: 'continue' | 'submit' | 'search_company' | 'confirm_data';
    error?: boolean;
}

interface ChatWizardProps {
    onComplete: (leadId: string, matches: any[]) => void;
}

export default function ChatWizard({ onComplete }: ChatWizardProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [extractedData, setExtractedData] = useState<ExtractedData>({});
    const [companyFound, setCompanyFound] = useState<CompanyFound | null>(null);
    const [conversationStarted, setConversationStarted] = useState(false);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Start conversation with initial greeting
    useEffect(() => {
        if (!conversationStarted) {
            setConversationStarted(true);
            setTimeout(() => {
                setMessages([{
                    id: 'init',
                    content: "Olá! 👋 Vou encontrar os melhores fundos europeus para ti.\n\nPodes começar por:\n• Dizer o nome da empresa (eu pesquiso o NIF e setor!)\n• Ou perguntar que fundos estão abertos",
                    role: 'assistant'
                }]);
            }, 500);
        }
    }, [conversationStarted]);

    const handleSend = async (quickReply?: string) => {
        const textToSend = quickReply || inputValue.trim();
        if (!textToSend || isLoading) return;

        setInputValue('');
        setError(null);

        // Add user message
        const newUserMessage: Message = {
            id: Date.now().toString(),
            content: textToSend,
            role: 'user'
        };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        // Focus input for next message
        inputRef.current?.focus();

        try {
            const response = await fetch('/api/lead-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, newUserMessage],
                    extractedData,
                    companyFound
                })
            });

            if (!response.ok) {
                throw new Error('Falha na comunicação com o assistente');
            }

            const data: ChatResponse = await response.json();

            // Update extracted data
            if (data.extracted) {
                setExtractedData(prev => ({
                    ...prev,
                    ...data.extracted
                }));
            }

            // Update company found
            if (data.company_found) {
                setCompanyFound(data.company_found);
            }

            // Build message with optional actions
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.message,
                role: 'assistant'
            };

            // Add confirmation actions if company was found
            if (data.action === 'confirm_data' && data.company_found) {
                botMessage.actions = [
                    { label: '✓ Confirmar', value: 'confirm', icon: 'confirm' },
                    { label: '✗ Não é esta', value: 'reject', icon: 'reject' }
                ];
            }

            setMessages(prev => [...prev, botMessage]);

            // Handle submit action
            if (data.complete || data.action === 'submit') {
                const finalData = {
                    ...extractedData,
                    ...data.extracted,
                    nome: data.extracted?.nome_empresa || extractedData.nome_empresa || '',
                    nif: data.extracted?.nif || extractedData.nif || '',
                    setor: data.extracted?.setor || extractedData.setor || '',
                    regiao: data.extracted?.regiao || extractedData.regiao || '',
                    email: data.extracted?.email || extractedData.email || ''
                };

                if (finalData.nome && finalData.email) {
                    await submitLead(finalData);
                } else if (!finalData.email) {
                    // Just need email
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: (Date.now() + 2).toString(),
                            content: "Só falta o teu email para te enviarmos o relatório completo:",
                            role: 'assistant'
                        }]);
                    }, 500);
                }
            }

        } catch (err: any) {
            console.error('Chat error:', err);
            setError(err.message);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                content: "Desculpe, tive um problema de ligação. Vamos continuar...",
                role: 'assistant'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (action: MessageAction) => {
        if (action.icon === 'confirm') {
            // User confirmed company data - ask for email to complete
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: `✅ Perfeito! Confirmo os dados da **${extractedData.nome_empresa || companyFound?.nome}**.\n\nSó falta o teu email para te enviarmos o relatório completo:`,
                role: 'user'
            }, {
                id: (Date.now() + 1).toString(),
                content: `Qual é o melhor email para te enviarmos o relatório?`,
                role: 'assistant'
            }]);
        } else if (action.icon === 'reject') {
            // User rejected - clear company data and ask again
            setCompanyFound(null);
            setExtractedData({});
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: "Sem problemas! Podes dizer-me:\n\n1. O nome correto da empresa\n2. Ou o NIF direto\n\nAssim pesquisamos novamente.",
                role: 'assistant'
            }]);
        }
    };

    const submitLead = async (finalData: any) => {
        try {
            setMessages(prev => [...prev, {
                id: 'processing',
                content: "🔍 A cruzar os seus dados com os avisos do PT2030, PRR e PEPAC...",
                role: 'assistant'
            }]);

            const response = await fetch('/api/leads/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            if (!response.ok) {
                throw new Error('Falha na submissão');
            }

            const result = await response.json();

            setTimeout(() => {
                onComplete(result.leadId, Array.isArray(result.matches) ? result.matches : []);
            }, 1500);

        } catch (error) {
            console.error('Submit error:', error);
            setMessages(prev => [...prev, {
                id: 'error-final',
                content: "Terminámos o diagnóstico. Vou mostrar os resultados disponíveis.",
                role: 'assistant'
            }]);
            setTimeout(() => {
                onComplete('error-lead', []);
            }, 1000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Progress indicator
    const fields = ['nome_empresa', 'nif', 'setor', 'regiao', 'email'];
    const filledFields = fields.filter(f => extractedData[f as keyof ExtractedData]);
    const progress = Math.round((filledFields.length / fields.length) * 100);

    return (
        <Card className="w-full max-w-2xl mx-auto h-[680px] flex flex-col bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center">
                        <Bot className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            Assistente TA
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                        </h3>
                        <p className="text-xs text-slate-400">
                            {progress > 0 ? `${progress}% completo` : 'Online • Pronto para ajudar'}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                    <div className="hidden sm:block w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className="max-w-[85%] space-y-2">
                                <div className={`p-4 rounded-2xl ${
                                    msg.role === 'assistant'
                                        ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                        : 'bg-blue-600 text-white rounded-tr-none'
                                }`}
                                // Parse markdown-like formatting
                                dangerouslySetInnerHTML={{
                                    __html: msg.content
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n/g, '<br>')
                                }}
                                />

                                {/* Action buttons */}
                                {msg.actions && (
                                    <div className="flex gap-2 ml-2">
                                        {msg.actions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAction(action)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                                                    action.icon === 'confirm'
                                                        ? 'bg-green-600 hover:bg-green-500 text-white'
                                                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                                }`}
                                            >
                                                {action.icon === 'confirm' && <CheckCircle className="w-4 h-4" />}
                                                {action.icon === 'reject' && <XCircle className="w-4 h-4" />}
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                                <Search className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <span className="text-slate-400 text-sm">A pesquisar...</span>
                                <div className="flex gap-1 ml-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Error display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 p-3 rounded-lg"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Data Collected Pills */}
            {filledFields.length > 0 && (
                <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800">
                    <div className="flex flex-wrap gap-2">
                        {extractedData.nome_empresa && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                ✓ {extractedData.nome_empresa}
                            </span>
                        )}
                        {extractedData.setor && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                ✓ {extractedData.setor}
                            </span>
                        )}
                        {extractedData.regiao && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                                ✓ {extractedData.regiao}
                            </span>
                        )}
                        {extractedData.nif && (
                            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
                                ✓ NIF: {extractedData.nif}
                            </span>
                        )}
                        {extractedData.email && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                                ✓ {extractedData.email}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            companyFound
                                ? "Confirma os dados ou diz o email..."
                                : progress === 0
                                    ? "Diz o nome da empresa ou pergunta sobre fundos..."
                                    : "Escreve a sua resposta..."
                        }
                        className="bg-slate-800 border-slate-700 text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isLoading}
                        className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-500 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                    Pressione Enter • Pesquisa automática com IA • NIF.PT + Racius
                </p>
            </div>
        </Card>
    );
}
