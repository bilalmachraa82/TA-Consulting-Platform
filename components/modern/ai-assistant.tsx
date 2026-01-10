'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, ExternalLink, FileText, Quote, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NeuralOrb } from '@/components/ui/neural-orb';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============ Types ============
interface Citation {
  title: string;
  url?: string;
  snippet?: string;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  citations?: Citation[];
}

// ============ Parser: Converte Markdown-like para React (SEM asteriscos visíveis) ============
function parseAIResponse(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: { text: string; type: 'ul' | 'ol' }[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    const isOrdered = listItems[0].type === 'ol';
    elements.push(
      <div key={`list-${elements.length}`} className="space-y-1.5 my-2">
        {listItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            {isOrdered ? (
              <span className="text-xs font-medium text-primary bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{parseBold(item.text)}</span>
          </div>
        ))}
      </div>
    );
    listItems = [];
  };

  // Converte **texto** para <span> estilizado (sem asteriscos visíveis)
  const parseBold = (line: string): React.ReactNode => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return line; // Sem negritos
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="font-semibold text-primary">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Lista não-ordenada (- item ou * item)
    if (/^[-*]\s/.test(trimmed)) {
      listItems.push({ text: trimmed.slice(2), type: 'ul' });
      return;
    }

    // Lista ordenada (1. item)
    if (/^\d+\.\s/.test(trimmed)) {
      listItems.push({ text: trimmed.replace(/^\d+\.\s/, ''), type: 'ol' });
      return;
    }

    // Separador ---
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="border-border/50 my-3" />);
      return;
    }

    // Linha vazia = espaço
    if (!trimmed) {
      flushList();
      return;
    }

    // Título (## ou ###)
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-semibold text-foreground mt-3 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          {parseBold(trimmed.slice(3))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-medium text-muted-foreground mt-2 mb-1">
          {parseBold(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    // Parágrafo normal
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground/90">
        {parseBold(trimmed)}
      </p>
    );
  });

  flushList();
  return elements;
}

// ============ Component ============
export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente inteligente da TA Consulting. Posso ajudar-te com avisos, candidaturas, empresas e muito mais. Como posso ajudar-te hoje?',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar mensagem');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.answer,
          isBot: true,
          timestamp: new Date(),
          citations: data.citations,
        },
      ]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Desculpa, ocorreu um erro ao processar a tua mensagem. Tenta novamente.',
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <NeuralOrb
              state={isLoading ? 'thinking' : 'idle'}
              onClick={() => setIsOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[620px]"
          >
            <Card className="h-full flex flex-col shadow-2xl border border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-primary/90 to-cyan-600/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/15 rounded-full backdrop-blur-sm">
                    <NeuralOrb state="active" className="w-7 h-7 pointer-events-none" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Assistente TA</h3>
                    <p className="text-[11px] text-white/70">Sempre disponível</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${message.isBot ? 'items-start' : 'items-end'}`}
                    >
                      {/* Bubble */}
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl ${message.isBot
                            ? 'bg-muted/70 text-foreground rounded-tl-sm'
                            : 'bg-gradient-to-br from-primary to-cyan-600 text-white rounded-tr-sm shadow-lg shadow-primary/20'
                          }`}
                      >
                        {message.isBot ? (
                          <div className="space-y-1">{parseAIResponse(message.text)}</div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.text}</p>
                        )}
                      </div>

                      {/* Citations */}
                      {message.isBot && message.citations && message.citations.length > 0 && (
                        <div className="mt-2.5 ml-1 max-w-[88%] space-y-1.5">
                          <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                            <Quote className="w-3 h-3" /> Fontes
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {message.citations.slice(0, 3).map((cit, idx) => (
                              <div
                                key={idx}
                                className="bg-card border border-border/50 px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer group text-xs"
                              >
                                <FileText className="w-3 h-3 text-primary flex-shrink-0" />
                                <span className="truncate max-w-[120px] text-muted-foreground group-hover:text-foreground transition-colors">
                                  {cit.title || 'Documento'}
                                </span>
                                {cit.url && (
                                  <a href={cit.url} target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className={`text-[10px] text-muted-foreground/60 mt-1 px-1`}>
                        {message.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start"
                    >
                      <div className="bg-muted/70 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t bg-background/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escreve a tua pergunta..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    className="flex-1 h-10 text-sm bg-muted/50 border-border/50 focus:border-primary/50"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    className="h-10 w-10 bg-gradient-to-br from-primary to-cyan-600 hover:opacity-90 shadow-md shadow-primary/20"
                    size="icon"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
