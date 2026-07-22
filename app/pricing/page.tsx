'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Página de preços — mesmo design system do resto do site (dark #0a0b0f,
 * emerald, Fraunces via .font-display). Números alinhados com a homepage
 * (683+ avisos, 10 portais); sem claims de concorrentes nem ícones em
 * círculos coloridos.
 */

const plans = [
    {
        id: 'FREE',
        name: 'Free',
        price: 0,
        description: 'Para experimentar a plataforma',
        featured: false,
        features: [
            '3 avisos/mês',
            'Chat básico com IA',
            'Alertas limitados',
            '1 empresa',
        ],
        cta: 'Começar grátis',
    },
    {
        id: 'STARTER',
        name: 'Starter',
        price: 29,
        description: 'Para consultores independentes',
        featured: true,
        features: [
            'Avisos ilimitados',
            'Chat IA ilimitado',
            'Smart Matching',
            'Alertas email',
            '5 empresas',
            'Suporte email',
        ],
        cta: 'Subscrever Starter',
    },
    {
        id: 'PRO',
        name: 'Pro',
        price: 79,
        description: 'Para equipas de consultoria',
        featured: false,
        features: [
            'Tudo do Starter',
            'Templates de candidatura',
            'AI Writer (beta)',
            'Export PDF',
            'Empresas ilimitadas',
            'Suporte prioritário',
        ],
        cta: 'Subscrever Pro',
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: 199,
        description: 'Para grandes operações',
        featured: false,
        features: [
            'Tudo do Pro',
            'White-label',
            'API dedicada',
            'Onboarding personalizado',
            'SLA garantido',
            'Gestor de conta',
        ],
        cta: 'Contactar vendas',
    },
];

const porques = [
    {
        titulo: 'Especialistas em fundos PT',
        texto: '10 portais oficiais — Portugal 2030, PRR, PEPAC, Turismo de Portugal e mais — varridos todos os dias.',
    },
    {
        titulo: 'Elegibilidade explicável',
        texto: 'Vês porque és (ou não) elegível, critério a critério. Nada de scores cegos.',
    },
    {
        titulo: 'Chat fundamentado',
        texto: 'Respostas baseadas nos regulamentos oficiais dos avisos, com citações.',
    },
];

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (planId: string) => {
        if (planId === 'FREE') {
            window.location.href = '/auth/register';
            return;
        }

        if (planId === 'ENTERPRISE') {
            window.location.href = 'mailto:vendas@aitipro.com?subject=Plano%20Enterprise%20Eligivo';
            return;
        }

        setLoading(planId);

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Erro ao criar checkout');
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Erro ao criar checkout');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f] text-slate-100 antialiased overflow-x-hidden">
            {/* Header — consistente com a homepage / encontrar-fundos */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0b0f]/70 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <span className="text-[#0a0b0f] font-bold">e</span>
                        </div>
                        <span className="font-display text-xl text-white">Eligivo</span>
                    </Link>
                    <nav className="flex items-center gap-5">
                        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
                            <ArrowLeft className="w-4 h-4" /> Início
                        </Link>
                        <Link href="/auth/login" className="text-sm text-slate-300 hover:text-white transition-colors">
                            Entrar
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] max-w-[120vw] h-[520px] bg-emerald-500/10 blur-[150px] rounded-full" />
                </div>
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
                    <h1 className="font-display text-4xl md:text-5xl text-white leading-tight mb-4">
                        Preços diretos, sem letras pequenas.
                    </h1>
                    <p className="text-lg text-slate-400 mb-8">
                        A análise de elegibilidade é grátis e sem registo. Pagas quando quiseres a plataforma completa.
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 683+ avisos abertos</span>
                        <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 10 portais monitorizados</span>
                        <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Análise explicável em 30s</span>
                    </div>
                </div>
            </section>

            {/* Grid de planos */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl p-6 bg-white/[0.03] border transition-colors ${plan.featured
                                    ? 'border-emerald-500/60 shadow-[0_0_40px_-12px] shadow-emerald-500/25'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-[#0a0b0f]">
                                            <Star className="w-3 h-3 fill-current" />
                                            Mais popular
                                        </span>
                                    </div>
                                )}

                                <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                                <p className="text-sm text-slate-400 mb-5">{plan.description}</p>

                                <div className="mb-6">
                                    <span className="font-display text-4xl text-white tabular-nums">€{plan.price}</span>
                                    <span className="text-slate-500">/mês</span>
                                </div>

                                <ul className="space-y-2.5 flex-1 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                            <span className="text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full font-semibold ${plan.featured
                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f]'
                                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 border border-white/10'
                                        }`}
                                    onClick={() => handleCheckout(plan.id)}
                                    disabled={loading === plan.id}
                                >
                                    {loading === plan.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            A processar…
                                        </>
                                    ) : (
                                        <>
                                            {plan.cta}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Porquê o Eligivo — editorial, sem ícones decorativos */}
            <section className="py-16 px-4 sm:px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-3xl text-white text-center mb-10">
                        Porquê o Eligivo?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {porques.map((p) => (
                            <div key={p.titulo}>
                                <h3 className="font-semibold text-slate-100 mb-2">{p.titulo}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{p.texto}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer — consistente com a homepage */}
            <footer className="border-t border-white/5 py-10 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                            <span className="text-[#0a0b0f] font-bold text-xs">e</span>
                        </div>
                        <span className="text-slate-400">Eligivo</span>
                    </Link>
                    <p>© 2026 Eligivo · Inteligência de fundos europeus</p>
                </div>
            </footer>
        </div>
    );
}
