'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Building2, User, Mail, MapPin, Target, Zap, Bot, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    component?: React.ReactNode;
}

interface ChatWizardProps {
    onComplete: (leadId: string, matches: any[]) => void;
}

export default function ChatWizard({ onComplete }: ChatWizardProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [step, setStep] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState({
        nif: '',
        nome: '',
        setor: '',
        regiao: '',
        email: '',
    });

    const steps = [
        {
            question: "Olá! Sou o assistente da TA Consulting. Vamos ver para que fundos a sua empresa é elegível? Para começar, qual é o nome da sua empresa?",
            field: 'nome',
            placeholder: 'Ex: Minha Empresa, Lda',
            icon: <Building2 className="w-4 h-4" />
        },
        {
            question: "Excelente. E qual é o NIF da empresa? (Isto ajuda-me a encontrar dados automaticamente)",
            field: 'nif',
            placeholder: '9 dígitos',
            icon: <Zap className="w-4 h-4" />
        },
        {
            question: "Em que setor de atividade operam?",
            field: 'setor',
            placeholder: 'Ex: Metalurgia, Software, Turismo...',
            icon: <Target className="w-4 h-4" />
        },
        {
            question: "Qual é a região principal de investimento?",
            field: 'regiao',
            placeholder: 'Ex: Norte, Alentejo, Lisboa...',
            icon: <MapPin className="w-4 h-4" />
        },
        {
            question: "Por fim, qual o seu email para enviarmos o relatório detalhado?",
            field: 'email',
            placeholder: 'email@empresa.pt',
            icon: <Mail className="w-4 h-4" />
        }
    ];

    useEffect(() => {
        addBotMessage(steps[0].question);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const addBotMessage = (text: string) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Math.random().toString(),
                text,
                isBot: true
            }]);
            setIsTyping(false);
        }, 1000);
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const currentStep = steps[step];
        const userText = inputValue;

        // Add user message
        setMessages(prev => [...prev, {
            id: Math.random().toString(),
            text: userText,
            isBot: false
        }]);

        // Update data
        const newData = { ...data, [currentStep.field]: userText };
        setData(newData);
        setInputValue('');

        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
            addBotMessage(steps[step + 1].question);
        } else {
            // Final Step - Process
            addBotMessage("Perfeito! Estou a cruzar os seus dados com os avisos do PT2030, PRR e PEPAC... Só um momento.");
            await submitLead(newData);
        }
    };

    const submitLead = async (finalData: any) => {
        try {
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
                // Ensure matches is an array to prevent crashes
                onComplete(result.leadId, Array.isArray(result.matches) ? result.matches : []);
            }, 2000);
        } catch (error) {
            console.error(error);
            // On error, finish with no matches instead of hanging or crashing
            addBotMessage("Concluí o diagnóstico, mas houve um erro de ligação. Vou mostrar o painel geral.");
            setTimeout(() => {
                onComplete('error-lead', []);
            }, 2000);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center">
                        <Bot className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            Assistente de Diagnóstico
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                        </h3>
                        <p className="text-xs text-slate-400">Online • IA da TA Consulting</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.isBot
                                ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                : 'bg-blue-600 text-white rounded-tr-none'
                                }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3 text-slate-500">
                        {steps[step]?.icon}
                    </div>
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={steps[step]?.placeholder}
                        className="pl-10 bg-slate-800 border-slate-700 text-white h-12 rounded-xl focus:ring-blue-500"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-500 shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center uppercase tracking-widest font-semibold">
                    Step {step + 1} of {steps.length}
                </p>
            </div>
        </Card>
    );
}
