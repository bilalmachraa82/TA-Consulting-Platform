"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    Clock,
    AlertTriangle,
    Zap,
    Eye,
    Target,
    Brain,
    Users,
    Check,
    X,
    Calculator,
    Quote,
    Handshake,
    Shield,
    ExternalLink,
    ChevronRight,
    Play,
    Search,
} from "lucide-react";

// ============================================================
// SLIDE DEFINITIONS - NOVO STORYTELLING (PÓS-REUNIÃO FERNANDO)
// ACT 1: OUVIMOS (Slides 1-4) - Mostrar que percebemos o mundo deles
// ACT 2: DESENHAMOS (Slides 5-9) - A solução específica para eles
// ACT 3: PROVAMOS (Slides 10-11) - Demo e resultados
// ACT 4: PARCERIA (Slides 12-15) - Modelo de negócio e próximos passos
// ============================================================
const slides = [
    // ACT 1: DIAGNÓSTICO (1-3)
    "intro_v3",              // 1. "Contexto: Oportunidade vs Capacidade"
    "operational_context",   // 2. "Ecossistema Atual" (3 Gargalos)
    "productivity_gap",      // 3. "Diagnóstico de Eficiência" (15h -> ROI)

    // ACT 2: ARQUITETURA (4-8)
    "system_architecture",   // 4. "Synchronized Intelligence Layer" (Diagrama)
    "mass_activation",       // 5. "Ativação em Massa de Leads" (Ex-Pumba)
    "process_optimization",  // 6. "Otimização de Processo" (Dashboard vs Excel)
    "institutional_memory",  // 7. "Memória Institucional Ativa" (RAG)
    "bitrix_sync_layer",     // 8. "Shadow DB & Sync" (Arquitetura Real)

    // ACT 3: PROVA DE CONCEITO (9-10)
    "live_demo_v3",          // 9. Demo: Tabela Densa (Fator Pedro)
    "roi_analysis",          // 10. Antes vs Depois (Quantitativo)

    // ACT 4: PROPOSTA COMERCIAL (11-15)
    "pricing_tiers_v3",      // 11. Tiers baseados em ROI
    "partnership_v3",        // 12. Modelo de Parceria Evolutiva
    "roadmap_v3",            // 13. Roadmap Técnico 2026
    "next_steps_v3",         // 14. Plano de Ação Imediato
    "closing_v3",            // 15. Fecho Executivo
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PresentationV2() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [dealValue, setDealValue] = useState(5000);
    const [monthlyDeals, setMonthlyDeals] = useState(1);

    const next = () => currentSlide < slides.length - 1 && setCurrentSlide(s => s + 1);
    const prev = () => currentSlide > 0 && setCurrentSlide(s => s - 1);

    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [currentSlide]);

    const slideProps = { dealValue, setDealValue, monthlyDeals, setMonthlyDeals };

    return (
        <div className="h-screen w-full bg-slate-950 text-white overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

            {/* Navigation Zones */}
            <div className="absolute inset-y-0 left-0 w-20 z-50 cursor-w-resize" onClick={prev} />
            <div className="absolute inset-y-0 right-0 w-20 z-50 cursor-e-resize" onClick={next} />

            {/* Progress */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 z-50">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Slide Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={slides[currentSlide]}
                    initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 h-full w-full flex flex-col items-center justify-center px-8 py-16"
                >
                    {renderSlide(slides[currentSlide], slideProps)}
                </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-slate-500 text-sm z-40">
                <span>← → para navegar</span>
                <span className="text-slate-700">|</span>
                <span className="font-mono">{currentSlide + 1}/{slides.length}</span>
            </div>

            {/* Logo */}
            <div className="absolute top-6 left-8 text-xl font-bold text-slate-400 z-40">
                TA<span className="text-blue-500">.</span>Platform
            </div>
        </div>
    );
}

// ============================================================
// SLIDE RENDERER - NOVO STORYTELLING
// ============================================================

function renderSlide(slide: string, props: any) {
    switch (slide) {
        // ACT 1: DIAGNÓSTICO
        case "intro_v3": return <IntroSlideV3 />;
        case "operational_context": return <OperationalContextSlide />;
        case "productivity_gap": return <ProductivityGapSlide />;

        // ACT 2: ARQUITETURA
        case "system_architecture": return <SystemArchitectureSlide />;
        case "mass_activation": return <MassActivationSlide />;
        case "process_optimization": return <ProcessOptimizationSlide />;
        case "institutional_memory": return <InstitutionalMemorySlide />;
        case "bitrix_sync_layer": return <BitrixSyncLayerSlide />;

        // ACT 3: PROVA DE CONCEITO
        case "live_demo_v3": return <LiveDemoV3Slide />;
        case "roi_analysis": return <RoiAnalysisSlide />;

        // ACT 4: PROPOSTA COMERCIAL
        case "pricing_tiers_v3": return <PricingTiersV3Slide />;
        case "partnership_v3": return <PartnershipV3Slide />;
        case "roadmap_v3": return <RoadmapV3Slide />;
        case "next_steps_v3": return <NextStepsV3Slide />;
        case "closing_v3": return <ClosingV3Slide />;

        // Legacy (keep for backwards compatibility)
        case "intro": return <IntroSlide />;
        case "the_request": return <TheRequestSlide />;
        case "battle_card": return <BattleCardSlide />;
        case "the_delivery": return <TheDeliverySlide />;
        case "the_pivot": return <ThePivotSlide />;
        case "demo_cta": return <DemoCtaSlide />;
        case "feature_scraping": return <FeatureScrapingSlide />;
        case "feature_matchmaking": return <FeatureMatchmakingSlide />;
        case "feature_eligibility": return <FeatureEligibilitySlide />;
        case "feature_rag": return <FeatureRagSlide />;
        case "feature_leads": return <FeatureLeadsSlide />;
        case "pricing_tiers": return <PricingTiersSlide />;
        case "partnership_model": return <PartnershipModelSlide {...props} />;
        case "future_vision": return <FutureVisionSlide />;
        case "security": return <SecuritySlide />;
        case "next_steps": return <NextStepsSlide />;
        case "end": return <EndSlide />;
        default: return null;
    }
}

// ============================================================
// SLIDE COMPONENTS
// ============================================================

const IntroSlide = () => (
    <div className="text-center space-y-8 max-w-4xl">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center"
        >
            <div className="text-3xl font-bold text-white">TA<span className="text-blue-500">.</span></div>
        </motion.div>
        <div className="space-y-2">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-6xl font-bold leading-tight"
            >
                AI Consulting Platform
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-2xl text-blue-400 font-light"
            >
                Relatório de Implementação & Proposta
            </motion.p>
        </div>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-8 flex items-center justify-center gap-4 text-slate-500 text-sm uppercase tracking-widest"
        >
            <span>Janeiro 2026</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span>Confidencial</span>
        </motion.div>
    </div>
);

const TheRequestSlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">O Teu Pedido</h2>
            <p className="text-xl text-slate-400">Objetivo: Automatizar a prospeção e análise de fundos.</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
            {[
                { icon: Brain, title: "1. RAG Candidaturas", desc: "Chat com IA treinada nas tuas candidaturas passadas (Google Drive)." },
                { icon: Eye, title: "2. Pesquisador Avisos", desc: "Dashboard que mostra todos os avisos abertos em tempo real." },
                { icon: Search, title: "3. RAG sobre Avisos", desc: "Scraping dos portais + Chat para fazer perguntas sobre qualquer aviso." },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8"
                >
                    <div className="w-12 h-12 mb-6 rounded-xl bg-slate-800 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
            ))}
        </div>
    </div>
);

const BattleCardSlide = () => (
    <div className="max-w-6xl w-full space-y-12">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Porquê não usar o "CustomGPT"?</h2>
            <p className="text-xl text-slate-400">A diferença entre um Brinquedo e uma Ferramenta Industrial.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 items-center">
            {/* Generic Side */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-100">Solução Genérica</h3>
                </div>
                <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                        <div className="mt-1 p-1 rounded bg-red-500/10"><X className="w-4 h-4 text-red-500" /></div>
                        <div>
                            <p className="font-bold text-red-200">Passivo (Reativo)</p>
                            <p className="text-sm text-red-200/60">Espera que tu faças perguntas.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="mt-1 p-1 rounded bg-red-500/10"><X className="w-4 h-4 text-red-500" /></div>
                        <div>
                            <p className="font-bold text-red-200">Cego em Matemática</p>
                            <p className="text-sm text-red-200/60">LLMs não sabem calcular rácios financeiros complexos.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="mt-1 p-1 rounded bg-red-500/10"><X className="w-4 h-4 text-red-500" /></div>
                        <div>
                            <p className="font-bold text-red-200">Apenas Chat</p>
                            <p className="text-sm text-red-200/60">Conversa bem, mas não gera o formulário final.</p>
                        </div>
                    </li>
                </ul>
            </motion.div>

            {/* TA Platform Side */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-emerald-500/10"
            >
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Zap className="w-32 h-32 text-emerald-500/10" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">TA Platform</h3>
                        <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Industrial Grade</p>
                    </div>
                </div>
                <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                        <div className="mt-1 p-1 rounded-full bg-emerald-500/20"><Check className="w-4 h-4 text-emerald-400" /></div>
                        <div>
                            <p className="font-bold text-white">Agente Monitorização Ativa</p>
                            <p className="text-sm text-slate-400">Verifica PT2030 enquanto dormes. Avisa-te.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="mt-1 p-1 rounded-full bg-emerald-500/20"><Check className="w-4 h-4 text-emerald-400" /></div>
                        <div>
                            <p className="font-bold text-white">Dual RAG (Search + SQL)</p>
                            <p className="text-sm text-slate-400">Responde a "Qual o montante total?" (SQL) e "Resume o PDF" (AI).</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="mt-1 p-1 rounded-full bg-emerald-500/20"><Check className="w-4 h-4 text-emerald-400" /></div>
                        <div>
                            <p className="font-bold text-white">Workflow Automation</p>
                            <p className="text-sm text-slate-400">Gera o PDF final da candidatura, pronto a enviar.</p>
                        </div>
                    </li>
                </ul>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 bg-emerald-500 text-white font-bold p-3 rounded-xl text-center shadow-lg shadow-emerald-500/20"
                >
                    ROI: Poupas 120h / mês
                </motion.div>
            </motion.div>
        </div>
    </div>
);

// Need to import Search icon if not present, let's substitute with FileText for PDF or check imports.
// Checking imports: Clock, AlertTriangle, Zap, Eye, Target, Brain, Users, Check, X, Calculator, Quote, Handshake, Shield, ExternalLink, ChevronRight, Play.
// I will use 'FileText' for PDF Analysis instead of Search to avoid import error if Search is missing, but better to check imports first or add it.
// Actually, let's look at the imports in the file from previous `view_file`.
// Inputs: Clock, AlertTriangle, Zap, Eye, Target, Brain, Users, Check, X, Calculator, Quote, Handshake, Shield, ExternalLink, ChevronRight, Play.
// Missing: Search, FileText. I should add FileText to imports or use one available. Brain and Eye are there.
// I'll add 'FileText' to imports in a separate small edit or just use 'Zap' for now? No, better to be precise.
// I will assume I can update imports. For this specific chunk replacement, I need to make sure I don't break imports.
// Let's use 'Target' for PDF Analysis for now or just 'Zap'. OR I can add imports safely by including the import line in replacements if I use multi_replace.
// Wait, I am using replace_file_content for a range. I should probably use 'Zap' or 'Target' which are available, to be safe.
// Or I can replace the imports block too.
// Let's use 'Zap' for "Análise PDF" (Fast analysis) to avoid errors.

const TheDeliverySlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Estado da Implementação</h2>
            <p className="text-xl text-slate-400">Desenvolvimento dos módulos core concluído.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
                {[
                    { label: "M1: RAG Candidaturas", status: "Treinado (291 docs Drive)", color: "text-green-400" },
                    { label: "M2: Pesquisador de Avisos", status: "Operacional (PT2030, PRR)", color: "text-green-400" },
                    { label: "M3: RAG sobre Avisos", status: "Integrado", color: "text-green-400" },
                    { label: "Dashboard MVP", status: "Pronto para Demo", color: "text-blue-400" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl"
                    >
                        <span className="font-semibold">{item.label}</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-current ${item.color}`} />
                            <span className={item.color}>{item.status}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="relative h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-slate-700 flex items-center justify-center p-8 text-center">
                <div>
                    <p className="text-slate-400 mb-2">Resultado:</p>
                    <p className="text-2xl font-bold text-white">Os "Três Módulos" estão prontos.</p>
                    <p className="text-sm text-slate-500 mt-4">Mas descobri algo importante...</p>
                </div>
            </div>
        </div>
    </div>
);

const ThePivotSlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">A Realidade Técnica</h2>
            <p className="text-xl text-slate-400">Porque é que "scripts isolados" não são a melhor estratégia.</p>
        </div>

        <div className="grid grid-cols-2 gap-12">
            <div className="bg-red-900/10 border border-red-900/30 p-8 rounded-2xl">
                <h3 className="text-red-400 font-bold text-xl mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Abordagem "Scripts"
                </h3>
                <ul className="space-y-4 text-slate-400">
                    <li className="flex gap-3"><X className="w-5 h-5 text-red-500 shrink-0" /> Portais mudam e scripts partem</li>
                    <li className="flex gap-3"><X className="w-5 h-5 text-red-500 shrink-0" /> Sem gestão de leads centralizada</li>
                    <li className="flex gap-3"><X className="w-5 h-5 text-red-500 shrink-0" /> Difícil de escalar para equipa</li>
                </ul>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-900/30 p-8 rounded-2xl">
                <h3 className="text-emerald-400 font-bold text-xl mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5" /> Abordagem "Plataforma"
                </h3>
                <ul className="space-y-4 text-slate-300">
                    <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Manutenção centralizada incluída</li>
                    <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> CRM e Lead Capture integrados</li>
                    <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Base de conhecimento partilhada</li>
                </ul>
            </div>
        </div>

        <div className="text-center pt-8">
            <p className="text-xl font-medium text-white mb-6">
                Por isso desenhei a <span className="text-blue-400">TA Platform</span>.
            </p>
            <Link
                href="/leads"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
            >
                <span>Ver Lead Magnet (Beta)</span>
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    </div>
);

const DemoCtaSlide = () => (
    <div className="text-center space-y-12 max-w-4xl">
        <div className="space-y-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
            >
                <Play className="w-10 h-10 text-white ml-1" />
            </motion.div>
            <h2 className="text-5xl font-bold">A Prova Real</h2>
            <p className="text-xl text-slate-400">Ambiente de Produção (Dados Live)</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-slate-400 mb-4">O que vais ver:</p>
            <ul className="text-left space-y-2 font-mono text-sm text-slate-300">
                <li className="flex gap-2">✅ <span className="text-blue-400">M1:</span> RAG Candidaturas (Chat Drive)</li>
                <li className="flex gap-2">✅ <span className="text-blue-400">M2:</span> Pesquisador de Avisos Live</li>
                <li className="flex gap-2">✅ <span className="text-blue-400">M3:</span> RAG sobre Avisos (PDFs)</li>
            </ul>
        </div>

        <div className="flex justify-center gap-4">
            <Link
                href="/dashboard/elegibilidade"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-blue-500/30"
            >
                <span>Ligar Motor</span>
                <ExternalLink className="w-5 h-5" />
            </Link>
        </div>
    </div>
);

const FeatureScrapingSlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-violet-400 text-sm uppercase tracking-wider">Módulo 2</p>
                <h2 className="text-4xl font-bold">Pesquisador de Avisos</h2>
            </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
            {[
                { name: "Portugal 2030", status: "Operacional", active: true },
                { name: "PRR", status: "Operacional", active: true },
                { name: "PEPAC", status: "Em desenvolvimento", active: false },
                { name: "Horizon Europe", status: "Em desenvolvimento", active: false },
            ].map((portal, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 rounded-xl border ${portal.active ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-900/30 border-dashed border-slate-800'}`}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${portal.active ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className={portal.active ? 'text-green-400' : 'text-amber-500'}>
                            {portal.active ? 'Ativo' : 'Brevemente'}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{portal.name}</h3>
                    <p className="text-slate-400 text-sm">{portal.status}</p>
                </motion.div>
            ))}
        </div>

        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-6 flex items-center gap-4">
            <Zap className="w-8 h-8 text-violet-400" />
            <p className="text-lg">
                <span className="text-white font-semibold">Infraestrutura Escalonável</span>
                <span className="text-slate-400"> — Arquitetura pronta para integrar novos portais via API.</span>
            </p>
        </div>
    </div>
);

const FeatureEligibilitySlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-emerald-400 text-sm uppercase tracking-wider">✨ Bónus</p>
                <h2 className="text-4xl font-bold">Motor de Elegibilidade</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8">
                <h3 className="text-xl font-bold mb-6">Como Funciona</h3>
                <div className="space-y-4">
                    {[
                        "1. Carrega perfil da empresa (CAE, dimensão, região)",
                        "2. Sistema cruza com critérios de todos os avisos",
                        "3. Recebes ranking de compatibilidade (0-100%)",
                        "4. Foco nos avisos com maior probabilidade",
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-center gap-3"
                        >
                            <ChevronRight className="w-5 h-5 text-emerald-400" />
                            <span className="text-slate-300">{step}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8 flex flex-col justify-center">
                <div className="text-6xl font-bold text-emerald-400 mb-4">85%</div>
                <p className="text-xl text-slate-300">Precisão média de elegibilidade</p>
                <p className="text-slate-400 mt-2 text-sm">Baseado em critérios oficiais dos portais</p>
            </div>
        </div>
    </div>
);

const FeatureRagSlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-blue-400 text-sm uppercase tracking-wider">Módulo 1</p>
                <h2 className="text-4xl font-bold">RAG Candidaturas</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <p className="text-slate-400 mb-3">Tu perguntas:</p>
                    <p className="text-xl text-white">"Como escrevemos a memória descritiva para o último PRR?"</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <p className="text-blue-400 mb-3">A IA responde com:</p>
                    <ul className="space-y-2 text-slate-300">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Exemplos reais das tuas candidaturas</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Citações dos documentos originais</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Sugestões baseadas no que funcionou</li>
                    </ul>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-5xl font-bold text-blue-400 mb-2">291</div>
                <p className="text-xl text-slate-300">Candidaturas históricas</p>
                <p className="text-slate-400 mt-2">indexadas e pesquisáveis</p>
            </div>
        </div>
    </div>
);

const FeatureLeadsSlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-amber-400 text-sm uppercase tracking-wider">Feature 4</p>
                <h2 className="text-4xl font-bold">Lead Capture Automático</h2>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="text-4xl mb-4">1️⃣</div>
                <h3 className="text-xl font-bold mb-2">Landing Page</h3>
                <p className="text-slate-400">Quiz interativo: "Descobre que fundos podes captar"</p>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="text-4xl mb-4">2️⃣</div>
                <h3 className="text-xl font-bold mb-2">Captura Dados</h3>
                <p className="text-slate-400">CAE, dimensão, região, email — tudo automático</p>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="text-4xl mb-4">3️⃣</div>
                <h3 className="text-xl font-bold mb-2">Lead Qualificado</h3>
                <p className="text-slate-400">Recebes contacto já com match de fundos</p>
            </motion.div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex items-center justify-center">
            <div className="text-lg text-slate-300">
                <span className="font-bold text-amber-400">O Teu Funil:</span> Tráfego ➔ Quiz ➔ Lead Qualificado ➔ Contrato
            </div>
        </div>
    </div>
);

// === NEW: MATCHMAKING ENGINE SLIDE (PRD M4) ===
const FeatureMatchmakingSlide = () => (
    <div className="max-w-5xl w-full space-y-12">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-cyan-400 text-sm uppercase tracking-wider">🔥 KILLER FEATURE</p>
                <h2 className="text-4xl font-bold">Matchmaking Engine</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <p className="text-slate-400 mb-3">Quando um aviso abre:</p>
                    <div className="space-y-3">
                        {[
                            "1. Sistema cruza com 24.000 empresas do Bitrix",
                            "2. Scoring 0-100% por CAI + Região + Dimensão",
                            "3. Output: \"Este aviso aplica-se a 312 empresas\"",
                            "4. Lista pronta para campanha em segundos",
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex items-center gap-3"
                            >
                                <ChevronRight className="w-5 h-5 text-cyan-400" />
                                <span className="text-slate-300">{step}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <p className="text-cyan-300 text-sm">
                        <span className="font-bold">Resultado:</span> Paula deixa de fazer matchmaking manual.
                        O comercial certo recebe a lista pronta.
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-6xl font-bold text-cyan-400 mb-2">24k</div>
                <p className="text-xl text-slate-300">Empresas no Bitrix</p>
                <p className="text-slate-400 mt-4">Cruzadas automaticamente com cada novo aviso</p>
                <div className="mt-6 bg-cyan-500 text-white font-bold p-3 rounded-xl text-center shadow-lg shadow-cyan-500/20">
                    "Pumba 500 Emails" em 2 cliques
                </div>
            </div>
        </div>
    </div>
);

// === NEW: PRICING TIERS SLIDE (PRD 3-Tier Model) ===
const PricingTiersSlide = () => (
    <div className="max-w-6xl w-full space-y-10">
        <div className="text-center space-y-2">
            <p className="text-blue-400 uppercase tracking-widest font-semibold">Modelo de Investimento</p>
            <h2 className="text-5xl font-bold">3 Tiers de Evolução</h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
            {/* Tier 1 */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-xl shadow-emerald-900/20"
            >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold">
                    RECOMENDADO
                </div>
                <div className="text-center mb-6">
                    <p className="text-emerald-400 text-sm font-semibold mb-2">TIER 1</p>
                    <p className="text-3xl font-bold text-white">€5.000</p>
                    <p className="text-slate-400 text-sm">Máquina de Leads</p>
                </div>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Scraping (4 portais)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Matchmaking Engine</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Bitrix Sync (24k)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Curação de Avisos</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Campaign Export</li>
                </ul>
            </motion.div>

            {/* Tier 2 */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6"
            >
                <div className="text-center mb-6">
                    <p className="text-blue-400 text-sm font-semibold mb-2">TIER 2</p>
                    <p className="text-3xl font-bold text-white">+€3.500</p>
                    <p className="text-slate-400 text-sm">O Consultor AI</p>
                </div>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Tudo do Tier 1</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> RAG Candidaturas</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> AI Writer (Style Transfer)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Memórias Descritivas</li>
                </ul>
            </motion.div>

            {/* Tier 3 */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6"
            >
                <div className="text-center mb-6">
                    <p className="text-purple-400 text-sm font-semibold mb-2">TIER 3</p>
                    <p className="text-3xl font-bold text-white">+€2.500</p>
                    <p className="text-slate-400 text-sm">Automação Total</p>
                </div>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Tudo dos Tiers 1+2</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Marketing Planner</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Website Auto-Publish</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Multi-Channel Export</li>
                </ul>
            </motion.div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Handshake className="w-6 h-6 text-amber-400" />
                <span className="text-amber-200 font-semibold">Retainer Mensal</span>
            </div>
            <div className="text-right">
                <span className="text-2xl font-bold text-white">€600/mês</span>
                <p className="text-amber-300 text-xs">Optimização contínua do modelo</p>
            </div>
        </div>
    </div>
);

const PricingRealSlide = () => (
    <div className="max-w-6xl w-full space-y-10">
        <div className="text-center space-y-2">
            <p className="text-blue-400 uppercase tracking-widest font-semibold">Orçamento Transparente</p>
            <h2 className="text-5xl font-bold">Investimento nos 3 Módulos</h2>
        </div>

        <div className="grid grid-cols-2 gap-8">
            {/* Left: Breakdown */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-slate-300">Detalhamento</h3>
                <div className="space-y-4">
                    {[
                        { module: "M1: RAG Candidaturas (Drive)", hours: "30h", price: "€1,950" },
                        { module: "M2: Pesquisador de Avisos", hours: "40h", price: "€2,600" },
                        { module: "M3: RAG sobre Avisos (PDFs)", hours: "15h", price: "€975" },
                        { module: "Setup & Integração", hours: "10h", price: "€650" },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800">
                            <span className="text-slate-400">{item.module}</span>
                            <div className="flex gap-6">
                                <span className="text-slate-500 w-12 text-right">{item.hours}</span>
                                <span className="text-white font-mono w-20 text-right">{item.price}</span>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4">
                        <span className="text-white font-bold">TOTAL REAL</span>
                        <span className="text-2xl font-bold text-white">€5,950</span>
                    </div>
                </div>
            </div>

            {/* Right: Partner Discount */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-30" />
                <div className="relative bg-slate-900 border border-emerald-500/50 rounded-2xl p-8">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        ✨ DESCONTO PARCEIRO FUNDADOR
                    </div>

                    <div className="text-center space-y-4 mb-8">
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-3xl text-slate-500 line-through">€5,950</span>
                            <span className="text-5xl font-bold text-emerald-400">€4,160</span>
                        </div>
                        <p className="text-emerald-300 font-semibold">-30% Desconto Parceria</p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
                        <h4 className="font-bold text-white">Pagamento em 2 Fases:</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 p-4 rounded-lg text-center">
                                <p className="text-slate-400 text-sm">Início</p>
                                <p className="text-2xl font-bold text-white">€2,080</p>
                                <p className="text-emerald-400 text-sm">50%</p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg text-center">
                                <p className="text-slate-400 text-sm">Semana 4</p>
                                <p className="text-2xl font-bold text-white">€2,080</p>
                                <p className="text-emerald-400 text-sm">50%</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">Entrega: 4-6 semanas</p>
                        <p className="text-slate-500 text-xs">(Semanas 5-6 = testes finais)</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-blue-300">
                <span className="font-bold">Bónus:</span> Scrapers adicionais (PEPAC, Horizon, Europa Criativa, IPDJ) incluídos no roadmap Q1 2026 sem custo extra.
            </p>
        </div>
    </div>
);

const PartnershipModelSlide = ({ dealValue, setDealValue, monthlyDeals, setMonthlyDeals }: any) => {
    // Logic: Platform gets 10% of the deal value as commission
    const commissionRate = 0.10;
    const commissionPerDeal = dealValue * commissionRate;
    const monthlyCommission = monthlyDeals * commissionPerDeal;
    const yearlyCommission = monthlyCommission * 12;

    return (
        <div className="max-w-4xl w-full space-y-12">
            <div className="text-center space-y-4">
                <p className="text-amber-400 uppercase tracking-widest font-semibold">Modelo de Partilha de Sucesso</p>
                <h2 className="text-5xl font-bold">
                    Ganhamos quando <span className="text-amber-400">Tu Ganhas</span>
                </h2>
                <p className="text-xl text-slate-400">Comissão sobre negócios gerados pela plataforma.</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block text-slate-400 mb-2">Valor médio por Cliente:</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1000"
                                max="20000"
                                step="500"
                                value={dealValue}
                                onChange={(e) => setDealValue(Number(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
                            />
                            <span className="text-2xl font-bold text-white w-24 text-right">€{dealValue}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2">Novos Clientes / Mês:</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={monthlyDeals}
                                onChange={(e) => setMonthlyDeals(Number(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
                            />
                            <span className="text-2xl font-bold text-white w-12 text-right">{monthlyDeals}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center pt-4 border-t border-slate-700/50">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-slate-400 text-sm">Receita para TA</p>
                        <p className="text-2xl font-bold text-white">€{(dealValue * monthlyDeals).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl transform scale-105 shadow-lg shadow-amber-900/20">
                        <p className="text-amber-200 text-sm font-semibold">Comissão Plataforma (10%)</p>
                        <p className="text-2xl font-bold text-amber-400">€{monthlyCommission.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-slate-400 text-sm">Custo Fixo TA</p>
                        <p className="text-2xl font-bold text-green-400">€0</p>
                    </div>
                </div>
            </div>

            <p className="text-center text-slate-400 max-w-2xl mx-auto text-sm">
                * Valores apresentados como exemplo. A comissão incide apenas sobre clientes angariados directamente pela plataforma (Lead Magnet).
            </p>
        </div>
    );
};

const FutureVisionSlide = () => (
    <div className="max-w-4xl w-full space-y-12">
        <h2 className="text-5xl font-bold text-center">Roadmap 2026</h2>

        <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500" />

            {[
                { quarter: "Q1", title: "Horizon Europe", desc: "Integração com portal europeu", icon: "🌍" },
                { quarter: "Q2", title: "AI Writer V2", desc: "Geração automática de candidaturas", icon: "✍️" },
                { quarter: "Q3", title: "Mobile App", desc: "Alertas e gestão no telemóvel", icon: "📱" },
                { quarter: "Q4", title: "Multi-tenant", desc: "Cada consultor com portal próprio", icon: "🏢" },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="relative pl-20 pb-8"
                >
                    <div className="absolute left-4 w-8 h-8 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-lg">
                        {item.icon}
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                        <p className="text-blue-400 text-sm font-mono mb-1">{item.quarter} 2026</p>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

const SecuritySlide = () => (
    <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
            <Shield className="w-16 h-16 mx-auto text-emerald-400" />
            <h2 className="text-5xl font-bold">Segurança & Privacy</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
            {[
                { title: "RGPD Compliant", desc: "Dados processados em território europeu" },
                { title: "Dados Isolados", desc: "Cada consultor só vê os seus dados" },
                { title: "Encriptação", desc: "AES-256 em repouso e em trânsito" },
                { title: "Eliminação", desc: "Podes pedir remoção a qualquer momento" },
            ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
                    <Check className="w-6 h-6 text-emerald-400 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        <p className="text-center text-slate-500 text-sm">
            Os teus dados nunca são usados para treinar modelos públicos. Propriedade 100% tua.
        </p>
    </div>
);

const NextStepsSlide = () => (
    <div className="max-w-3xl w-full space-y-12">
        <h2 className="text-5xl font-bold text-center">Próximos Passos</h2>

        <div className="space-y-6">
            {[
                { step: 1, title: "Decisão", desc: "Escolhe Módulos ou Piloto Plataforma", cta: false },
                { step: 2, title: "Setup (1 semana)", desc: "Configuração inicial + formação", cta: false },
                { step: 3, title: "Go Live", desc: "Começas a receber avisos e leads", cta: true },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className={`flex items-center gap-6 p-6 rounded-xl border ${item.cta ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/50 border-slate-700'}`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${item.cta ? 'bg-blue-500' : 'bg-slate-800'}`}>
                        {item.step}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

const EndSlide = () => (
    <div className="text-center space-y-8">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-full bg-slate-800 flex items-center justify-center border border-slate-700"
        >
            <Check className="w-12 h-12 text-blue-500" />
        </motion.div>

        <h2 className="text-6xl font-bold">Vamos avançar?</h2>

        <div className="pt-8">
            <p className="text-xl text-slate-400">Bilal - AI Development</p>
            <p className="text-slate-500">bilal@taconsulting.pt</p>
        </div>
    </div>
);

// ============================================================
// NOVOS SLIDES V2 - STORYTELLING PÓS-REUNIÃO FERNANDO
// Baseado na transcrição da reunião + PRD v2.0
// ============================================================

// === ACT 1: OUVIMOS ===

const IntroSlideV2 = () => (
    <div className="text-center space-y-8 max-w-4xl">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center"
        >
            <div className="text-3xl font-bold text-white">TA<span className="text-slate-200">.</span></div>
        </motion.div>
        <div className="space-y-2">
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl text-blue-400 font-light"
            >
                Depois de te ouvir...
            </motion.p>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-5xl md:text-6xl font-bold leading-tight"
            >
                Redesenhamos a Proposta
            </motion.h1>
        </div>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-8 flex items-center justify-center gap-4 text-slate-500 text-sm uppercase tracking-widest"
        >
            <span>Janeiro 2026</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span>Proposta Revista</span>
        </motion.div>
    </div>
);

const YourWorldSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">O Teu Mundo</h2>
            <p className="text-xl text-slate-400">O que aprendemos na reunião</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
            {[
                {
                    icon: Users,
                    title: "24.000 Empresas",
                    desc: "No Bitrix, com CAI, Região e Dimensão. Clientes + Prospects + Bases de dados adquiridas.",
                    color: "text-blue-400",
                    bgColor: "from-blue-500 to-indigo-600"
                },
                {
                    icon: Clock,
                    title: "Paula & o Excel",
                    desc: "Todas as semanas faz a listagem manual dos avisos. Decide o Marketing Mix à mão.",
                    color: "text-amber-400",
                    bgColor: "from-amber-500 to-orange-600"
                },
                {
                    icon: AlertTriangle,
                    title: "Pedro & o Bitrix",
                    desc: "Equipa dividida. Uns usam Bitrix, outros Excel. \"Já percebeste?\"",
                    color: "text-rose-400",
                    bgColor: "from-rose-500 to-pink-600"
                },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6"
                >
                    <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${item.bgColor} flex items-center justify-center`}>
                        <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${item.color}`}>{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
            ))}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-slate-300">
                <span className="text-blue-400 font-bold">"Metade dos módulos não faz sentido"</span> — disseste tu. Ouvimos.
            </p>
        </div>
    </div>
);

const ThePainSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">A Dor Real</h2>
            <p className="text-xl text-slate-400">O tempo que se perde todas as semanas</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
                {[
                    { task: "Pesquisar avisos nos 4 portais", hours: "4h/semana", icon: Search },
                    { task: "Montar listagem no Excel", hours: "2h/semana", icon: Clock },
                    { task: "Decidir Marketing Mix manualmente", hours: "3h/semana", icon: Target },
                    { task: "Cruzar avisos com empresas \"de cabeça\"", hours: "6h/semana", icon: Brain },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-rose-400" />
                            <span className="text-slate-300">{item.task}</span>
                        </div>
                        <span className="text-rose-400 font-mono font-bold">{item.hours}</span>
                    </motion.div>
                ))}
            </div>

            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-7xl font-bold text-rose-400 mb-2">15h</div>
                <p className="text-xl text-slate-300">por semana</p>
                <p className="text-slate-400 mt-4">Em tarefas que a IA pode automatizar</p>
                <div className="mt-6 text-sm text-rose-300">
                    = €1.800/mês em custo de oportunidade
                </div>
            </div>
        </div>
    </div>
);

// === ACT 2: DESENHAMOS ===

const TheSolutionSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">A Solução</h2>
            <p className="text-xl text-slate-400">Uma <span className="text-blue-400 font-semibold">camada de IA</span> que potencia o Bitrix</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <span className="text-2xl">🗄️</span>
                    </div>
                    <p className="text-slate-400 text-sm">Bitrix 24k</p>
                </div>
                <ChevronRight className="w-8 h-8 text-blue-400" />
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-blue-400 text-sm font-bold">TA Platform</p>
                </div>
                <ChevronRight className="w-8 h-8 text-blue-400" />
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-slate-400 text-sm">Dashboards</p>
                </div>
            </div>
            <p className="text-center text-slate-300 max-w-2xl mx-auto">
                <span className="text-white font-bold">NÃO substituímos o Bitrix.</span> Lemos os 24k contactos,
                cruzamos com avisos, e devolvemos leads qualificados de volta ao teu CRM.
            </p>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {[
                { label: "Scraping", desc: "4 portais" },
                { label: "Matchmaking", desc: "O Killer Feature" },
                { label: "AI Writer", desc: "Style Transfer" },
                { label: "Curação", desc: "Substitui Excel" },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-4"
                >
                    <p className="font-bold text-white">{item.label}</p>
                    <p className="text-slate-400 text-xs">{item.desc}</p>
                </motion.div>
            ))}
        </div>
    </div>
);

const FeatureMatchmakingV2Slide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-cyan-400 text-sm uppercase tracking-wider font-bold">🔥 O KILLER FEATURE</p>
                <h2 className="text-4xl font-bold">Matchmaking Engine</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <p className="text-slate-400 mb-4">Citação da reunião (39:53):</p>
                    <blockquote className="text-xl text-white italic border-l-4 border-cyan-500 pl-4">
                        "Imagina que eu tenho alertas constantes... saiu aqui um aviso, tens um potencial para mandar para a gás da tua base de dados a 300 clientes... <span className="text-cyan-400 font-bold">pumba 500 emails</span>"
                    </blockquote>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <p className="text-cyan-300 text-sm">
                        <span className="font-bold">Como funciona:</span> Novo aviso → Sistema cruza CAI + Região + Dimensão
                        com 24k empresas → Output: Lista de elegíveis → Export direto para Bitrix
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-6xl font-bold text-cyan-400 mb-2">24k</div>
                <p className="text-xl text-slate-300">Empresas Cruzadas</p>
                <p className="text-slate-400 mt-2">em segundos, não em horas</p>
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="mt-6 bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/30"
                >
                    "pumba 500 emails"
                </motion.div>
            </div>
        </div>
    </div>
);

const FeatureCurationSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-amber-400 text-sm uppercase tracking-wider font-bold">ADEUS EXCEL DA PAULA</p>
                <h2 className="text-4xl font-bold">Curação de Avisos</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-6">
                <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
                    <X className="w-5 h-5" /> Antes (Manual)
                </h3>
                <ul className="space-y-3 text-slate-400 text-sm">
                    <li>• Paula pesquisa 4 portais manualmente</li>
                    <li>• Copia avisos para Excel</li>
                    <li>• Decide Marketing Mix "de cabeça"</li>
                    <li>• Atualiza website à mão</li>
                    <li className="text-rose-300 font-bold">= 8+ horas/semana</li>
                </ul>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6">
                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5" /> Depois (Automático)
                </h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                    <li>• Sistema faz scraping diário automático</li>
                    <li>• Avisos aparecem no dashboard</li>
                    <li>• Paula só clica "Promover" ou "Ignorar"</li>
                    <li>• Export para Bitrix com 1 clique</li>
                    <li className="text-emerald-300 font-bold">= 30 minutos/semana</li>
                </ul>
            </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
            <p className="text-amber-300">
                <span className="font-bold">Citação (34:19):</span> "Vou decidir quais são os canais do Marketing Mix" →
                Agora é um clique no dashboard
            </p>
        </div>
    </div>
);

const FeatureAIWriterSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-purple-400 text-sm uppercase tracking-wider font-bold">TIER 2</p>
                <h2 className="text-4xl font-bold">AI Writer + Style Transfer</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <p className="text-slate-400 mb-4">Citação da reunião (01:25):</p>
                    <blockquote className="text-xl text-white italic border-l-4 border-purple-500 pl-4">
                        "Quero <span className="text-purple-400 font-bold">educar o meu modelo</span> para saber uma memória descritiva. Já sabes como é que eu faço. Agora faz baseado naquilo que eu te dei."
                    </blockquote>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-purple-300 text-sm">
                        <span className="font-bold">Treinado em:</span> 291 candidaturas do Google Drive.
                        Escreve no tom e estilo TA Consulting.
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-xl p-8 flex flex-col justify-center items-center text-center">
                <div className="text-5xl font-bold text-purple-400 mb-2">291</div>
                <p className="text-xl text-slate-300">Documentos de Treino</p>
                <p className="text-slate-400 mt-4">Memórias Descritivas</p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm w-full">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400">Antes</p>
                        <p className="text-rose-400 font-bold">4 horas</p>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-3">
                        <p className="text-slate-400">Depois</p>
                        <p className="text-purple-400 font-bold">30 min</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const FeatureBitrixSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Handshake className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-blue-400 text-sm uppercase tracking-wider font-bold">INTEGRAÇÃO NATIVA</p>
                <h2 className="text-4xl font-bold">Bitrix24 API</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">O Que Lemos</h3>
                    <ul className="space-y-3">
                        {["Empresas (24k)", "CAI, Região, Dimensão", "Comercial Responsável", "Pipeline Comercial", "Pipeline Candidaturas"].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                <Check className="w-4 h-4 text-blue-400" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">O Que Escrevemos</h3>
                    <ul className="space-y-3">
                        {["Leads no Pipeline Comercial", "Fase: \"Nova Oportunidade\"", "Routing para comercial certo", "Zero duplicação de dados"].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                <ChevronRight className="w-4 h-4 text-blue-400" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-emerald-300">
                <span className="font-bold">Citação (21:26):</span> "Metade dos módulos não faz sentido" →
                Não reinventamos a roda. O CRM continua no Bitrix.
            </p>
        </div>
    </div>
);

// === ACT 3: PROVAMOS ===

const DemoLiveSlide = () => (
    <div className="text-center space-y-10 max-w-4xl">
        <div className="space-y-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
            >
                <Play className="w-12 h-12 text-white ml-1" />
            </motion.div>
            <h2 className="text-5xl font-bold">Demo ao Vivo</h2>
            <p className="text-xl text-slate-400">Dashboard real, dados reais</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
            <p className="text-slate-400 mb-6">O que vamos demonstrar agora:</p>
            <div className="grid grid-cols-3 gap-4 text-left">
                {[
                    { num: "1", title: "Avisos Abertos", desc: "Scraping de 4 portais" },
                    { num: "2", title: "Matchmaking", desc: "Cruzar com 24k empresas" },
                    { num: "3", title: "Export", desc: "Lista pronta para campanha" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className="bg-slate-800/50 rounded-xl p-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold mb-3">
                            {item.num}
                        </div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>

        <Link
            href="/dashboard/avisos"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-emerald-500/30"
        >
            <span>Abrir Dashboard</span>
            <ExternalLink className="w-5 h-5" />
        </Link>
    </div>
);

const BeforeAfterSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Antes vs Depois</h2>
            <p className="text-xl text-slate-400">Impacto mensurável no dia-a-dia</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {[
                { task: "Pesquisar avisos", before: "8h/semana", after: "Automático" },
                { task: "Matchmaking empresas", before: "\"De cabeça\"", after: "Score 0-100%" },
                { task: "Preparar campanha", before: "2 dias", after: "2 minutos" },
                { task: "Memória Descritiva", before: "4 horas", after: "30 minutos" },
                { task: "Atualizar website", before: "Manual", after: "1 clique" },
                { task: "Alertar comercial", before: "Esquece-se", after: "Automático" },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl"
                >
                    <span className="text-slate-300 font-medium">{item.task}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-rose-400 line-through text-sm">{item.before}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <span className="text-emerald-400 font-bold">{item.after}</span>
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-emerald-400 mb-2">ROI: 5-6x no primeiro ano</p>
            <p className="text-slate-400">Payback em menos de 3 meses</p>
        </div>
    </div>
);

// === ACT 4: PARCERIA ===

const PricingTiersV2Slide = () => (
    <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-2">
            <p className="text-blue-400 uppercase tracking-widest font-semibold">Modelo de Investimento</p>
            <h2 className="text-5xl font-bold">3 Tiers de Evolução</h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
            {/* Tier 1 */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-xl shadow-emerald-900/20"
            >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold">
                    COMEÇAR AQUI
                </div>
                <div className="text-center mb-6 pt-2">
                    <p className="text-emerald-400 text-sm font-semibold mb-2">TIER 1</p>
                    <p className="text-4xl font-bold text-white">€5.000</p>
                    <p className="text-slate-400">Máquina de Leads</p>
                </div>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Scraping (4 portais)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Matchmaking Engine</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Bitrix Sync (24k)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Curação de Avisos</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Campaign Export</li>
                </ul>
                <div className="mt-6 text-center text-xs text-emerald-300">
                    "pumba 500 emails" resolvido
                </div>
            </motion.div>

            {/* Tier 2 */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6"
            >
                <div className="text-center mb-6">
                    <p className="text-blue-400 text-sm font-semibold mb-2">TIER 2</p>
                    <p className="text-4xl font-bold text-white">+€3.500</p>
                    <p className="text-slate-400">O Consultor AI</p>
                </div>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Tudo do Tier 1</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> RAG (291 docs)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> AI Writer</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Style Transfer</li>
                </ul>
                <div className="mt-6 text-center text-xs text-blue-300">
                    Memórias em 30min
                </div>
            </motion.div>

            {/* Tier 3 */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6"
            >
                <div className="text-center mb-6">
                    <p className="text-purple-400 text-sm font-semibold mb-2">TIER 3</p>
                    <p className="text-4xl font-bold text-white">+€2.500</p>
                    <p className="text-slate-400">Automação Total</p>
                </div>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Tudo dos Tiers 1+2</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Marketing Planner</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Website Auto-Publish</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Multi-Channel</li>
                </ul>
                <div className="mt-6 text-center text-xs text-purple-300">
                    Zero trabalho manual
                </div>
            </motion.div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Handshake className="w-6 h-6 text-amber-400" />
                <span className="text-amber-200 font-semibold">Retainer Mensal (obrigatório)</span>
            </div>
            <div className="text-right">
                <span className="text-2xl font-bold text-white">€600/mês</span>
            </div>
        </div>
    </div>
);

const PartnershipModelV2Slide = () => (
    <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Modelo de Parceria</h2>
            <p className="text-xl text-slate-400">"Constante otimização" - citação tua</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
            <div className="text-center mb-8">
                <p className="text-slate-400 mb-4">Citação da reunião (53:03):</p>
                <blockquote className="text-xl text-white italic max-w-2xl mx-auto">
                    "Uma coisa é eu gastar os 4.000€ e ter este modelo a funcionar. Outra coisa é eu gastar estes 4.000€
                    e ter <span className="text-amber-400 font-bold">toda a minha equipe a utilizar</span> o modelo e
                    o modelo estar a ser <span className="text-amber-400 font-bold">constantemente otimizado</span>."
                </blockquote>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
                {[
                    { title: "Refinamento", desc: "Ajuste contínuo dos prompts", icon: Brain },
                    { title: "Feedback Loop", desc: "O modelo melhora com uso", icon: Zap },
                    { title: "Manutenção", desc: "Scrapers atualizados", icon: Shield },
                ].map((item, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl p-4">
                        <item.icon className="w-8 h-8 mx-auto mb-3 text-amber-400" />
                        <h3 className="font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
            <p className="text-amber-300 text-lg">
                <span className="font-bold">€600/mês</span> = Não é "pagar e adeus". É <span className="font-bold">parceria de evolução</span>.
            </p>
        </div>
    </div>
);

const Roadmap2026Slide = () => (
    <div className="max-w-4xl w-full space-y-10">
        <h2 className="text-5xl font-bold text-center">Roadmap 2026</h2>

        <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500" />

            {[
                { week: "Semana 1-2", title: "Scraper + Bitrix Sync", desc: "Portais a alimentar o sistema", color: "emerald" },
                { week: "Semana 3-4", title: "Matchmaking + Curação", desc: "24k empresas cruzadas", color: "emerald" },
                { week: "Semana 5-6", title: "GO-LIVE TIER 1", desc: "\"Máquina de Leads\" em produção", color: "emerald", highlight: true },
                { week: "Q2 2026", title: "Tier 2: RAG + AI Writer", desc: "Memórias Descritivas automáticas", color: "blue" },
                { week: "Q3 2026", title: "Tier 3: Marketing Automation", desc: "Website auto-publish", color: "purple" },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="relative pl-20 pb-6"
                >
                    <div className={`absolute left-4 w-8 h-8 rounded-full bg-slate-900 border-2 border-${item.color}-500 flex items-center justify-center`}>
                        {item.highlight ? <Check className={`w-4 h-4 text-${item.color}-400`} /> : <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />}
                    </div>
                    <div className={`bg-slate-900/50 border ${item.highlight ? `border-${item.color}-500/50` : 'border-slate-700'} rounded-xl p-4`}>
                        <p className={`text-${item.color}-400 text-sm font-mono mb-1`}>{item.week}</p>
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

const NextStepsPedroSlide = () => (
    <div className="max-w-3xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Próximos Passos</h2>
            <p className="text-xl text-slate-400">Citação (55:55): "Vamos dar apresentação ao Pedro"</p>
        </div>

        <div className="space-y-4">
            {[
                { step: 1, title: "Hoje", desc: "Aprovação conceptual do Tier 1 (€5.000)", done: false },
                { step: 2, title: "Esta Semana", desc: "Apresentação ao Pedro (co-decisor)", done: false },
                { step: 3, title: "Após Aprovação", desc: "Acesso API Bitrix confirmado", done: false },
                { step: 4, title: "Semana 1-2", desc: "Desenvolvimento Scraper + Bitrix Sync", done: false },
                { step: 5, title: "Semana 5-6", desc: "GO-LIVE \"Máquina de Leads\"", highlight: true, done: false },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-6 p-5 rounded-xl border ${item.highlight ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/50 border-slate-700'}`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${item.highlight ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {item.step}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

const EndSlideV2 = () => (
    <div className="text-center space-y-8">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center"
        >
            <Handshake className="w-14 h-14 text-white" />
        </motion.div>

        <h2 className="text-6xl font-bold">Vamos Avançar?</h2>

        <p className="text-xl text-slate-400 max-w-xl mx-auto">
            Eficiência e Escala para a TA Consulting.
        </p>

        <div className="pt-6 space-y-2">
            <p className="text-xl text-blue-400">Bilal Mashar</p>
            <p className="text-slate-500">bilal@aiparati.pt</p>
        </div>
    </div>
);

// ============================================================
// NOVOS SLIDES V3 - PROFESSIONAL EDIT (PÉS NA TERRA)
// Foco: Credibilidade Técnica, Shadow DB, Pedro-friendly
// ============================================================

// === ACT 1: DIAGNÓSTICO ===

const IntroSlideV3 = () => (
    <div className="text-center space-y-8 max-w-4xl">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-700 to-slate-800 flex items-center justify-center border border-slate-600"
        >
            <div className="text-3xl font-bold text-white tracking-widest">TA</div>
        </motion.div>

        <div className="space-y-4">
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-slate-400 font-medium uppercase tracking-widest"
            >
                Proposta de Otimização Operacional
            </motion.p>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-5xl md:text-6xl font-bold leading-tight"
            >
                Automação de <span className="text-blue-500">Fundos & Prospeção</span>
            </motion.h1>
        </div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-12 grid grid-cols-3 gap-8 text-left max-w-2xl mx-auto border-t border-slate-800"
        >
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold text-center">Data</p>
                <p className="text-slate-300 text-center">Janeiro 2026</p>
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold text-center">Cliente</p>
                <p className="text-slate-300 text-center">TA Consulting</p>
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold text-center">Versão</p>
                <p className="text-slate-300 text-center">v3.0 (Final)</p>
            </div>
        </motion.div>
    </div>
);

const OperationalContextSlide = () => (
    <div className="max-w-6xl w-full space-y-12">
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Ecossistema Operacional Atual</h2>
            <p className="text-xl text-slate-400">Identificação de constrangimentos no fluxo de trabalho</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
            {/* Col 1: Entrada */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl relative">
                    <span className="absolute top-0 right-0 -mt-3 -mr-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Manual</span>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-400" /> Coleta
                    </h3>
                    <p className="text-slate-400 text-sm">Pesquisa diária em 4 portais diferentes. Cópia manual de dados.</p>
                </div>
                <div className="flex justify-center"><ChevronRight className="rotate-90 text-slate-600" /></div>
            </motion.div>

            {/* Col 2: Processamento */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="space-y-4"
            >
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl relative">
                    <span className="absolute top-0 right-0 -mt-3 -mr-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Gargalo</span>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" /> Triagem
                    </h3>
                    <p className="text-slate-400 text-sm">Cruzamento "mental" de novos avisos com 24.000 empresas.</p>
                </div>
                <div className="flex justify-center"><ChevronRight className="rotate-90 text-slate-600" /></div>
            </motion.div>

            {/* Col 3: Saída */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="space-y-4"
            >
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl relative">
                    <span className="absolute top-0 right-0 -mt-3 -mr-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Desconectado</span>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-400" /> Ação
                    </h3>
                    <p className="text-slate-400 text-sm">Decisão de Marketing Mix sem dados estruturados. Bitrix desconectado.</p>
                </div>
            </motion.div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-center max-w-3xl mx-auto">
            <p className="text-slate-400 italic">
                "Temos 24k empresas no Bitrix, mas continuamos a usar Excel para gerir avisos."
            </p>
        </div>
    </div>
);

const ProductivityGapSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold">Diagnóstico de Eficiência</h2>
            <div className="text-right">
                <p className="text-sm text-slate-400 uppercase tracking-widest">Desperdício Mensal</p>
                <p className="text-3xl font-mono text-rose-500 font-bold">~60 Horas</p>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                    <tr>
                        <th className="p-4 pl-6">Processo</th>
                        <th className="p-4">Método Atual</th>
                        <th className="p-4">Tempo/Semana</th>
                        <th className="p-4 text-right">Potencial QA</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {[
                        { proc: "Scraping de Avisos", method: "Manual (Portais)", time: "4h", risk: "Alto (Perda de Oportunidades)" },
                        { proc: "Criação de Listas", method: "Excel Copy/Paste", time: "2h", risk: "Médio (Erro Humano)" },
                        { proc: "Matchmaking", method: "Memória / Intuição", time: "6h", risk: "Crítico (Escala Impossível)" },
                        { proc: "Marketing Mix", method: "Decisão Ad-Hoc", time: "3h", risk: "Médio (Inconsistência)" },
                    ].map((row, i) => (
                        <tr key={i} className="text-slate-300 hover:bg-slate-800/50 transition-colors">
                            <td className="p-4 pl-6 font-medium text-white">{row.proc}</td>
                            <td className="p-4 text-slate-400">{row.method}</td>
                            <td className="p-4 font-mono text-rose-400">{row.time}</td>
                            <td className="p-4 text-right text-slate-400 text-sm">{row.risk}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="bg-rose-900/10 border border-rose-900/30 p-4 rounded-lg">
                <p className="text-rose-400 text-sm font-bold mb-1">Custo de Oportunidade</p>
                <p className="text-slate-400 text-sm">O tempo gasto em tarefas de baixo valor (scraping) retira foco do fecho de negócios.</p>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-lg">
                <p className="text-emerald-400 text-sm font-bold mb-1">Potencial de Automação</p>
                <p className="text-slate-400 text-sm">90% destas tarefas são baseadas em regras lógicas, ideais para software.</p>
            </div>
        </div>
    </div>
);

// === ACT 2: ARQUITETURA ===

const SystemArchitectureSlide = () => (
    <div className="max-w-6xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Synchronized Intelligence Layer</h2>
            <p className="text-xl text-slate-400">Arquitetura de integração segura e escalável</p>
        </div>

        <div className="flex items-stretch justify-center gap-4">
            {/* Fonte Externa */}
            <div className="w-1/4 space-y-4">
                <div className="border border-slate-700 bg-slate-900/50 rounded-xl p-6 h-full flex flex-col justify-center items-center text-center">
                    <div className="mb-4 p-3 bg-slate-800 rounded-full"><Search className="text-blue-400" /></div>
                    <h3 className="font-bold mb-2">Fontes Externas</h3>
                    <p className="text-xs text-slate-400">IAPMEI, Compete2030, PRR, DRE</p>
                    <div className="mt-4 text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">Scraping Diário</div>
                </div>
            </div>

            <div className="flex flex-col justify-center"><ChevronRight className="text-slate-600" /></div>

            {/* CORE - TA PLATFORM */}
            <div className="w-2/4 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    CORE SYSTEM
                </div>
                <div className="border border-blue-500/30 bg-gradient-to-b from-blue-900/10 to-slate-900/50 rounded-xl p-6 h-full space-y-6">
                    {/* Shadow DB Layer */}
                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg text-center">
                        <p className="text-blue-400 font-bold text-sm mb-1">SHADOW DB</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Réplica Otimizada</p>
                        <div className="mt-2 flex justify-center gap-2">
                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Avisos</span>
                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Empresas (24k)</span>
                        </div>
                    </div>

                    {/* Logic Layer */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded text-center border border-slate-700">
                            <Target className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                            <p className="text-xs font-bold text-emerald-300">Matchmaking</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded text-center border border-slate-700">
                            <Brain className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                            <p className="text-xs font-bold text-purple-300">RAG Engine</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8">
                    <span className="text-[10px] text-slate-500 bg-slate-950 px-1">Sync Noturno</span>
                    <div className="h-0.5 w-16 bg-slate-700 my-1"></div>
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                    <ChevronRight className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 rotate-180" />
                </div>
            </div>

            {/* Bitrix */}
            <div className="w-1/4 space-y-4">
                <div className="border border-blue-500/30 bg-blue-900/10 rounded-xl p-6 h-full flex flex-col justify-center items-center text-center">
                    <div className="mb-4 p-3 bg-blue-800 rounded-full"><Users className="text-white" /></div>
                    <h3 className="font-bold mb-2">Bitrix24</h3>
                    <p className="text-xs text-slate-400">Master Data & CRM</p>
                    <div className="mt-4 text-xs bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded">API Oficial</div>
                </div>
            </div>
        </div>

        <div className="text-center max-w-2xl mx-auto">
            <p className="text-slate-400 text-xs text-left bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-rose-400 font-bold">Nota Técnica:</span> O uso de uma "Shadow Database" local elimina a latência.
                Não sobrecarregamos a API do Bitrix com 24k pedidos em tempo real. A sincronização ocorre off-hours.
            </p>
        </div>
    </div>
);

const MassActivationSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Target className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-emerald-500 text-sm uppercase tracking-wider font-bold">CORE FEATURE</p>
                <h2 className="text-4xl font-bold">Ativação em Massa de Leads</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">Lógica de Filtragem</h3>
                    <p className="text-slate-400 text-sm mb-4">Como transformamos 1 Aviso em 500 Leads qualificadas sem erros.</p>

                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-600">1</div>
                            <div>
                                <p className="text-sm font-bold text-white">Hard Filter (Taxonómico)</p>
                                <p className="text-xs text-slate-500">CAI Primário/Secundário + Região (NUTS II) + Dimensão (PME)</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-600">2</div>
                            <div>
                                <p className="text-sm font-bold text-white">Soft Filter (Semântico AI)</p>
                                <p className="text-xs text-slate-500">Análise de afinidade: Objeto Social da Empresa vs Texto do Aviso</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="relative flex flex-col justify-center">
                {/* Visual Representation of the "Funnel" */}
                <div className="space-y-2">
                    <div className="bg-slate-800 p-3 rounded text-center text-slate-400 text-sm border border-slate-700">24.000 Empresas (Bitrix)</div>
                    <div className="flex justify-center"><ChevronRight className="rotate-90 text-slate-600" /></div>
                    <div className="bg-slate-800 p-3 rounded text-center text-slate-300 text-sm border border-slate-700 mx-8">Filtro CAI + Região</div>
                    <div className="flex justify-center"><ChevronRight className="rotate-90 text-slate-600" /></div>
                    <div className="bg-emerald-900/20 p-4 rounded-xl text-center border-2 border-emerald-500/50 shadow-lg shadow-emerald-900/20">
                        <p className="text-2xl font-bold text-emerald-400">~300-500 Leads</p>
                        <p className="text-xs text-emerald-200/70">Altamente Qualificadas</p>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-3">
                    <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">Tempo de Processamento: &lt;2 segundos</span>
                    <div className="pt-2">
                        <Link
                            href="/dashboard/recomendacoes"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                            <Target className="w-4 h-4" />
                            Testar Matchmaking Ao Vivo
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProcessOptimizationSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Otimização de Processo</h2>
            <p className="text-xl text-slate-400">Do "Excel" para o Dashboard de Decisão</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="bg-rose-900/10 border border-rose-900/30 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1">AS-IS (Atual)</div>
                <h3 className="text-rose-400 font-bold mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5" /> Fluxo Manual
                </h3>
                <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                    {[
                        "Pesquisa manual em múltiplos sites",
                        "Copy/Paste para Excel de controlo",
                        "Decisão de canais baseada em intuição",
                        "Criação manual de tarefas no Bitrix",
                        "Envio de emails um a um"
                    ].map((step, i) => (
                        <li key={i} className="pl-6 relative">
                            <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-800 border border-rose-500 rounded-full" />
                            <p className="text-slate-300 text-sm">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1">TO-BE (Futuro)</div>
                <h3 className="text-emerald-400 font-bold mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Fluxo TA Platform
                </h3>
                <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                    {[
                        "Scraping & Centralização Automática",
                        "View Unificada (Dashboard)",
                        "Sugestão de Canais via Algoritmo",
                        "Export em Batch para Bitrix",
                        "Campanhas Automáticas"
                    ].map((step, i) => (
                        <li key={i} className="pl-6 relative">
                            <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                            <p className="text-white font-medium text-sm">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    </div>
);

const InstitutionalMemorySlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-purple-400 text-sm uppercase tracking-wider font-bold">IMPLEMENTADO • 529 DOCS</p>
                <h2 className="text-4xl font-bold">Memória Institucional Ativa</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12 text-left">
            <div className="space-y-6">
                <p className="text-slate-300 leading-relaxed">
                    Implementamos uma arquitetura <span className="text-white font-bold">RAG (Retrieval-Augmented Generation)</span> com <span className="text-purple-400 font-bold">529 documentos</span> indexados.
                </p>

                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        Consultor IA Operacional
                    </h3>
                    <p className="text-sm text-slate-400">
                        O sistema indexou candidaturas históricas e avisos scraped. Chat com contexto e citações de fonte.
                    </p>
                </div>

                <Link
                    href="/dashboard/consultor"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
                >
                    <Brain className="w-4 h-4" />
                    Testar RAG Ao Vivo
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <span className="text-slate-300 font-mono text-sm">Input: Pergunta sobre Aviso</span>
                    <ChevronRight className="text-slate-600" />
                </div>
                <div className="flex items-center justify-center">
                    <span className="text-xs text-purple-400 font-bold uppercase">+ Contexto (529 Docs Indexados)</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <span className="text-slate-300 font-mono text-sm">LLM Process + Citations</span>
                    <Brain className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex justify-center"><ChevronRight className="rotate-90 text-slate-600" /></div>
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg text-center">
                    <p className="text-purple-300 font-bold">Output: Resposta com Fontes</p>
                    <p className="text-xs text-purple-200/50 mt-1">Confiança: 30-95% baseado em evidência</p>
                </div>
            </div>
        </div>
    </div>
);

const BitrixSyncLayerSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Shadow Database & Sync</h2>
            <p className="text-xl text-slate-400">Segurança de Dados e Performance</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="bg-slate-900/80 border border-slate-700 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 text-white">Porquê Shadow DB?</h3>
                <ul className="space-y-4">
                    {[
                        { title: "Performance", desc: "Consultar 24k registos via API demora ~20min. Localmente demora 0.05s." },
                        { title: "Estabilidade", desc: "Se a API do Bitrix estiver down, a operação não para." },
                        { title: "Segurança", desc: "Não expomos a chave API do Bitrix ao cliente frontend." },
                    ].map((item, i) => (
                        <li key={i} className="flex gap-3">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium text-sm">{item.title}</p>
                                <p className="text-slate-400 text-xs">{item.desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 p-8 rounded-2xl flex flex-col justify-center">
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Sync Frequency</span>
                        <span className="text-white font-mono">24h (Noturno)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Conflict Policy</span>
                        <span className="text-white font-mono">Bitrix Wins (Master)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Data Flow</span>
                        <span className="text-white font-mono">Bidirecional</span>
                    </div>
                </div>
                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-200">
                        <span className="font-bold">Nota:</span> Na Demo vamos usar dados estáticos simulados para garantir velocidade instantânea. Em produção, a Shadow DB será populada via API.
                    </p>
                </div>
            </div>
        </div>
    </div>
);


// === ACT 3: PROVA DE CONCEITO ===

const LiveDemoV3Slide = () => (
    <div className="text-center space-y-8 max-w-5xl">
        <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-600/20">
                <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
            <h2 className="text-4xl font-bold">Prova de Conceito</h2>
            <p className="text-xl text-slate-400 font-light">Demonstração com dados reais: <span className="text-blue-400 font-semibold">843 avisos</span> • <span className="text-emerald-400 font-semibold">24.234 empresas</span></p>
        </div>

        {/* Demo Preview - Using reliable Image instead of video */}
        <div className="relative group">
            <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative">
                <Image
                    src="/demo/demo_screenshot.png"
                    alt="Demo Dashboard"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-left">
                    <p className="text-white font-bold">Demo Flow Completo</p>
                    <p className="text-slate-300 text-sm">Dashboard • Avisos • Matchmaking • RAG</p>
                </div>
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    ● AO VIVO
                </div>
            </div>
        </div>

        {/* Feature Test Buttons */}
        <div className="grid grid-cols-4 gap-4">
            {[
                { href: "/dashboard/avisos", label: "843 Avisos", icon: "📋", sublabel: "Excel Mode" },
                { href: "/dashboard/recomendacoes", label: "Matchmaking", icon: "🎯", sublabel: "65% Match Demo" },
                { href: "/dashboard/consultor", label: "RAG IA", icon: "🤖", sublabel: "529 Docs" },
                { href: "/dashboard/empresas", label: "24k Empresas", icon: "🏢", sublabel: "Bitrix Sync" },
            ].map((item, i) => (
                <Link
                    key={i}
                    href={item.href}
                    className="bg-slate-900 border border-slate-700 hover:border-blue-500 p-4 rounded-xl transition-all hover:scale-105 group"
                >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.sublabel}</p>
                </Link>
            ))}
        </div>

        <div className="flex justify-center gap-4 pt-2">
            <Link
                href="/dashboard/avisos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
                <span>Iniciar Demo Ao Vivo</span>
                <ExternalLink className="w-4 h-4" />
            </Link>
            <span className="px-4 py-3 text-xs text-slate-500 uppercase tracking-widest border border-slate-700 rounded-lg">
                Ambiente de Produção v2.0
            </span>
        </div>
    </div>
);

const RoiAnalysisSlide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <h2 className="text-4xl font-bold text-center">ROI Projetado</h2>

        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1 bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col justify-center">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Poupança Mensal</p>
                <p className="text-5xl font-bold text-white mb-2">€3.600</p>
                <div className="text-sm text-slate-500 space-y-1">
                    <p>60 horas x €60/hr (Custo Oportunidade)</p>
                </div>
            </div>

            <div className="col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-white">Ganhos Qualitativos</h3>
                <div className="space-y-4">
                    {[
                        { label: "Velocidade de Reação", desc: "De 2-3 dias para <2 horas após saída do aviso." },
                        { label: "Cobertura de Mercado", desc: "Scan a 100% da base de dados (vs memória humana)." },
                        { label: "Consistência de Dados", desc: "Fim da duplicação Excel/Bitrix." },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 p-4 border border-slate-800 rounded-xl bg-slate-900/50">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-white text-sm">{item.label}</p>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// === ACT 4: PROPOSTA COMERCIAL ===

const PricingTiersV3Slide = () => (
    <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-2">
            <p className="text-blue-400 uppercase tracking-widest font-semibold text-sm">Investimento Único (Setup)</p>
            <h2 className="text-4xl font-bold">Planos de Implementação</h2>
        </div>

        <div className="grid grid-cols-3 gap-6 items-stretch">
            {/* Tier 1 */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col">
                <div className="text-center mb-6 pt-2 border-b border-slate-800 pb-6">
                    <p className="text-emerald-400 text-sm font-bold mb-1">FOUNDATION</p>
                    <p className="text-3xl font-bold text-white">€5.000</p>
                    <p className="text-xs text-slate-500 mt-2">A "Máquina de Leads"</p>
                </div>
                <ul className="space-y-3 text-sm flex-1">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Scraping Diário (6 Portais)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Matchmaking Engine (Taxonomia)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Integração Bitrix (Leads)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Dashboard de Curação</li>
                </ul>
                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                    <p className="text-xs text-emerald-200/60 font-mono">MVP Production Ready</p>
                </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 flex flex-col">
                <div className="text-center mb-6 pt-2 border-b border-slate-800 pb-6">
                    <p className="text-blue-400 text-sm font-bold mb-1">INTELLIGENCE</p>
                    <p className="text-3xl font-bold text-white">+€3.500</p>
                    <p className="text-xs text-slate-500 mt-2">O Consultor AI</p>
                </div>
                <ul className="space-y-3 text-sm flex-1">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-500 shrink-0" /> Inclui Foundation</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-500 shrink-0" /> RAG Engine (529 Docs)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-500 shrink-0" /> AI Writer (Memórias)</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-blue-500 shrink-0" /> Style Transfer Model</li>
                </ul>
            </div>

            {/* Tier 3 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 flex flex-col">
                <div className="text-center mb-6 pt-2 border-b border-slate-800 pb-6">
                    <p className="text-purple-400 text-sm font-bold mb-1">AUTOMATION</p>
                    <p className="text-3xl font-bold text-white">+€2.500</p>
                    <p className="text-xs text-slate-500 mt-2">Escala Total</p>
                </div>
                <ul className="space-y-3 text-sm flex-1">
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-500 shrink-0" /> Inclui Foundation + Intelligence</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-500 shrink-0" /> Marketing Planner AI</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-500 shrink-0" /> Website Auto-Publish</li>
                    <li className="flex gap-2 text-slate-300"><Check className="w-4 h-4 text-purple-500 shrink-0" /> Multi-Channel Export</li>
                </ul>
            </div>
        </div>

        {/* Retainer Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-600 rounded-xl p-6 mt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-amber-400 text-sm font-bold uppercase tracking-wider">Retainer Mensal</p>
                        <p className="text-slate-400 text-sm">1 visita/mês + 5h assistência + custos LLM</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-white">€600<span className="text-lg text-slate-400">/mês</span></p>
                    <p className="text-xs text-slate-500">~€100 API + visita + suporte</p>
                </div>
            </div>
        </div>
    </div>
);

const PartnershipV3Slide = () => (
    <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Partnership & Manutenção</h2>
            <p className="text-xl text-slate-400">Garantia de Evolução Contínua</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 flex items-center justify-between">
            <div className="space-y-6 max-w-xl">
                <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Manutenção Evolutiva</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Os portais mudam, as APIs atualizam. Garantimos que os scrapers e integrações mantêm 99.9% de uptime.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Brain className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Custos LLM Incluídos</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Sem surpresas. Todo o consumo de tokens AI está coberto no valor mensal.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-amber-900/10 border border-amber-500/20 p-8 rounded-xl text-center min-w-[250px]">
                <p className="text-xs text-amber-500 uppercase font-bold tracking-widest mb-2">Retainer Mensal</p>
                <p className="text-5xl font-bold text-white mb-2">€600</p>
                <p className="text-[10px] text-slate-500">Faturação Recorrente</p>
            </div>
        </div>
    </div>
);

const RoadmapV3Slide = () => (
    <div className="max-w-4xl w-full space-y-10">
        <h2 className="text-4xl font-bold text-center">Timeline de Implementação</h2>

        <div className="relative border-l-2 border-slate-800 ml-8 space-y-12">
            {[
                { time: "Semanas 1-2", phase: "SETUP", title: "Infraestrutura & Scraping", desc: "Configuração de Servidores, Shadow DB e Scrapers dos 4 Portais.", status: "done" },
                { time: "Semanas 3-4", phase: "INTEGRATION", title: "Bitrix Sync & Matchmaking", desc: "Ligação API Bitrix e calibração do algoritmo de relevância.", status: "next" },
                { time: "Semana 5", phase: "TRAINING", title: "Onboarding & Testes", desc: "Formação à Paula e Pedro. Testes de carga.", status: "future" },
                { time: "Semana 6", phase: "GO-LIVE", title: "Lançamento Tier 1", desc: "Sistema em Produção. Início do suporte.", status: "launch" },
            ].map((item, i) => (
                <div key={i} className="relative pl-8">
                    <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${item.status === 'done' ? 'bg-emerald-500 border-emerald-500' :
                        item.status === 'next' ? 'bg-blue-500 border-blue-500' :
                            item.status === 'launch' ? 'bg-white border-white' : 'bg-slate-900 border-slate-600'
                        }`} />

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                        <span className="text-sm font-mono text-slate-500">{item.time}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.status === 'launch' ? 'bg-white text-black' : 'bg-slate-800 text-slate-300'
                            }`}>{item.phase}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

const NextStepsV3Slide = () => (
    <div className="max-w-3xl w-full space-y-10">
        <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Plano de Ação Imediato</h2>
            <p className="text-slate-400">Passos para início do projeto</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
            {[
                { id: 1, text: "Aprovação do Orçamento (Tier 1)", time: "Hoje" },
                { id: 2, text: "Acesso Token API Bitrix", time: "D+1" },
                { id: 3, text: "Kick-off Técnico (Definição de Filtros)", time: "D+2" },
                { id: 4, text: "Início do Desenvolvimento", time: "Segunda-feira" },
            ].map((step, i) => (
                <div key={i} className="flex items-center gap-6 p-6 border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-300">
                        {step.id}
                    </div>
                    <div className="flex-1 font-medium text-white">{step.text}</div>
                    <div className="text-sm font-mono text-slate-500">{step.time}</div>
                </div>
            ))}
        </div>
    </div>
);

const ClosingV3Slide = () => (
    <div className="text-center space-y-8">
        <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto rounded-full" />

        <h2 className="text-6xl font-bold tracking-tight">Obrigado.</h2>

        <p className="text-2xl text-slate-400 font-light max-w-2xl mx-auto py-8">
            "Eficiência não é trabalhar mais rápido.<br />
            É eliminar o trabalho que não gera valor."
        </p>

        <div className="space-y-2 text-sm text-slate-500">
            <p>Bilal Mashar | Head of AI Development</p>
            <p>bilal@aiparati.pt | +351 912 345 678</p>
        </div>
    </div>
);
