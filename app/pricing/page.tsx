'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Zap, Building2, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
        cta: 'Começar Grátis',
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
        cta: 'Contactar Vendas',
    },
];

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (planId: string) => {
        if (planId === 'FREE') {
            window.location.href = '/auth/signup';
            return;
        }

        if (planId === 'ENTERPRISE') {
            window.location.href = 'mailto:vendas@taconsulting.pt?subject=Enterprise%20Plan';
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
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-50">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">TA</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">TA Consulting</h1>
                                <p className="text-sm text-gray-600">Especialista em Fundos PT</p>
                            </div>
                        </Link>
                        <nav className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                                Dashboard
                            </Link>
                            <Link href="/auth/signin">
                                <Button variant="outline">Entrar</Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <Sparkles className="w-3 h-3 mr-1" />
                        50% mais barato que Granter.AI
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Preços Simples,{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Resultados Reais
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        O único especialista IA em fundos portugueses. PT2030, PRR, PEPAC — tudo numa plataforma.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 text-sm text-gray-600 mb-12">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            1817 avisos
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            529 docs RAG
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            6 portais PT
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Grid */}
            <section className="pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col ${plan.featured
                                        ? 'border-2 border-blue-600 shadow-xl scale-105'
                                        : 'border shadow-md'
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-blue-600 text-white">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            Mais Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-gray-900">
                                            €{plan.price}
                                        </span>
                                        <span className="text-gray-600">/mês</span>
                                    </div>

                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        className={`w-full ${plan.featured
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : ''
                                            }`}
                                        variant={plan.featured ? 'default' : 'outline'}
                                        onClick={() => handleCheckout(plan.id)}
                                        disabled={loading === plan.id}
                                    >
                                        {loading === plan.id ? (
                                            'A processar...'
                                        ) : (
                                            <>
                                                {plan.cta}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison */}
            <section className="py-16 px-6 bg-white border-t">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Por que escolher TA Consulting?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 mt-8">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Especialista Portugal</h3>
                            <p className="text-sm text-gray-600">
                                Foco exclusivo em PT2030, PRR, PEPAC e IPDJ. Conhecimento profundo.
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-2">RAG com Docs Oficiais</h3>
                            <p className="text-sm text-gray-600">
                                529 PDFs oficiais indexados. Respostas baseadas em regulamentos reais.
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold mb-2">50% Mais Barato</h3>
                            <p className="text-sm text-gray-600">
                                Metade do preço de soluções globais, com foco local superior.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t py-12 px-6">
                <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
                    <p>© 2025 TA Consulting. Especialistas em fundos portugueses.</p>
                </div>
            </footer>
        </div>
    );
}
