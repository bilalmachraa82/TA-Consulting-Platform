'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bot, Send, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
}

interface ExtractedData {
    nome_empresa?: string;
    nif?: string;
    setor?: string;
    regiao?: string;
    email?: string;
}

interface ChatResponse {
    message: string;
    extracted?: ExtractedData;
    missing?: string[];
    complete?: boolean;
    action?: 'continue' | 'submit' | 'validate';
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
            // Initial bot message
            setTimeout(() => {
                setMessages([{
                    id: 'init',
                    content: "Olá! 👋 Sou o assistente da TA Consulting. Vou ajudar a descobrir os melhores fundos europeus para a sua empresa. Como se chama a vossa empresa?",
                    role: 'assistant'
                }]);
            }, 500);
        }
    }, [conversationStarted]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setError(null);

        // Add user message
        const newUserMessage: Message = {
            id: Date.now().toString(),
            content: userMessage,
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
                    extractedData
                })
            });

            if (!response.ok) {
                throw new Error('Falha na comunicação com o assistente');
            }

            const data: ChatResponse = await response.json();

            // Update extracted data with new information
            if (data.extracted) {
                setExtractedData(prev => ({
                    ...prev,
                    ...data.extracted
                }));
            }

            // Add bot response
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.message,
                role: 'assistant'
            };
            setMessages(prev => [...prev, botMessage]);

            // Check if conversation is complete
            if (data.complete || data.action === 'submit') {
                // Collect final data from both sources
                const finalData = {
                    ...extractedData,
                    ...data.extracted,
                    nome: data.extracted?.nome_empresa || extractedData.nome_empresa || '',
                    nif: data.extracted?.nif || extractedData.nif || '',
                    setor: data.extracted?.setor || extractedData.setor || '',
                    regiao: data.extracted?.regiao || extractedData.regiao || '',
                    email: data.extracted?.email || extractedData.email || ''
                };

                // Validate we have the minimum required data
                if (finalData.nome && finalData.email) {
                    await submitLead(finalData);
                } else {
                    // If missing critical data, ask for it
                    const missingCritical: string[] = [];
                    if (!finalData.nome) missingCritical.push('nome da empresa');
                    if (!finalData.email) missingCritical.push('email');

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: (Date.now() + 2).toString(),
                            content: `Ainda preciso de alguns dados: ${missingCritical.join(' e ')}. Pode fornecer?`,
                            role: 'assistant'
                        }]);
                    }, 500);
                }
            }

        } catch (err: any) {
            console.error('Chat error:', err);
            setError(err.message);
            // Add error message but keep conversation going
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                content: "Desculpe, tive um problema de ligação. Vamos continuar...",
                role: 'assistant'
            }]);
        } finally {
            setIsLoading(false);
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

    // Progress indicator based on extracted data
    const fields = ['nome_empresa', 'nif', 'setor', 'regiao', 'email'];
    const filledFields = fields.filter(f => extractedData[f as keyof ExtractedData]);
    const progress = Math.round((filledFields.length / fields.length) * 100);

    return (
        <Card className="w-full max-w-2xl mx-auto h-[650px] flex flex-col bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden">
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
                            <div className={`max-w-[85%] p-4 rounded-2xl ${
                                msg.role === 'assistant'
                                    ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    : 'bg-blue-600 text-white rounded-tr-none'
                            }`}>
                                {msg.content}
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
                            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />
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
                        placeholder={progress === 0
                            ? "Comece por dizer o nome da sua empresa..."
                            : "Escreva a sua resposta..."
                        }
                        className="bg-slate-800 border-slate-700 text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-500 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                    Pressione Enter para enviar • IA Gemini 2.5 Flash
                </p>
            </div>
        </Card>
    );
}
