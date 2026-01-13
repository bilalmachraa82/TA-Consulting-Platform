'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download, Printer, FileText, Check, X, Crown, Star, Award, Zap, Clock, Shield, Target, Globe, Database, Lightbulb, AlertTriangle, ChevronRight, Users, MapPin, Building2, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// ============================================================================
// DATA - PROPOSTA TÉCNICA v3
// ============================================================================

const SECTIONS = [
    {
        id: 'visao-geral',
        title: 'Visão Geral',
        subtitle: 'Contexto do Projeto',
        icon: <Lightbulb className="w-6 h-6" />,
        color: 'blue',
        content: (
            <div className="space-y-6">
                <p className="text-lg text-blue-100 leading-relaxed">
                    A TA Consulting enfrenta um desafio crítico: a captação de fundos europeus é um processo manual, fragmentado e intensivo em recursos. Com <span className="text-white font-bold">24.000 empresas</span> na base de dados do Bitrix, mas apenas uma fração contactada ativamente, existe uma oportunidade subutilizada significativa.
                </p>
                <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-400/30 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-white mb-3">O Insight Crítico</h4>
                    <p className="text-blue-100 mb-3">
                        <span className="text-amber-400 font-semibold">95% dos avisos NÃO têm CAE.</span> O matching tradicional baseado em CAE é insuficiente.
                    </p>
                    <p className="text-blue-100">
                        A solução: <span className="text-emerald-400 font-semibold">Matching baseado em NUT + TIP</span> (NUTS III + Tipo de Intervenção Prioritária), que cobre a quase totalidade dos avisos publicados.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-300 uppercase mb-2">Centraliza</h5>
                        <p className="text-blue-100 text-sm">Scraping automático de PT2030, PRR, PEPAC</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-300 uppercase mb-2">Qualifica</h5>
                        <p className="text-blue-100 text-sm">Matching NUT+TIP com empresas do Bitrix</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-300 uppercase mb-2">Preserva</h5>
                        <p className="text-blue-100 text-sm">Conhecimento das 291 candidaturas históricas</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'dores',
        title: 'Análise das Dores',
        subtitle: 'O Problema Atual',
        icon: <AlertTriangle className="w-6 h-6" />,
        color: 'red',
        content: (
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="bg-red-500/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                        <p className="text-xl text-white italic mb-2">"Temos 24.000 empresas na base de dados, mas saber quem são não é saber quem são leads."</p>
                        <p className="text-red-300 text-sm">— Fernando, TA Consulting</p>
                    </div>
                    <div className="bg-orange-500/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                        <p className="text-xl text-white italic mb-2">"Hoje tudo se faz com Excel, pesquisas manuais, e muito copy-paste entre sistemas."</p>
                        <p className="text-orange-300 text-sm">— Fernando, TA Consulting</p>
                    </div>
                    <div className="bg-amber-500/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                        <p className="text-xl text-white italic mb-2">"95% dos avisos não têm CAE. Precisamos de outra forma de matching."</p>
                        <p className="text-amber-300 text-sm">— Fernando, TA Consulting</p>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="text-xl font-bold text-white mb-4">O Gap: Matching Tradicional vs. Realidade</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                            <h5 className="text-red-400 font-semibold mb-2">❌ Abordagem Antiga</h5>
                            <ul className="text-red-200 text-sm space-y-1">
                                <li>• Matching baseado em CAE</li>
                                <li>• Só funciona em 5% dos avisos</li>
                                <li>• Muitos falsos negativos</li>
                            </ul>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4">
                            <h5 className="text-emerald-400 font-semibold mb-2">✅ Nova Abordagem</h5>
                            <ul className="text-emerald-200 text-sm space-y-1">
                                <li>• Matching NUT + TIP</li>
                                <li>• Cobertura de 95% dos avisos</li>
                                <li>• Baseado na realidade dos portais</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'fase1',
        title: 'FASE 1',
        subtitle: '€4.500 + IVA • 8 semanas',
        icon: <Star className="w-6 h-6" />,
        color: 'blue',
        badge: 'IMEDIATO',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/30 to-blue-600/30 border border-blue-400/50 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-blue-300" />
                        <div>
                            <p className="text-white font-semibold text-lg">O Motor de Oportunidades</p>
                            <p className="text-blue-200 text-sm">Do aviso à lead em minutos</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Scraping 3 Portais</h4>
                        </div>
                        <p className="text-blue-100 text-sm">PT2030, PRR, PEPAC • Verificação a cada 6 horas • Parser de PDFs com LLM</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Extração NUT + TIP</h4>
                        </div>
                        <p className="text-blue-100 text-sm">NUTS III (Norte, Centro, Lisboa...) + TIP (IPSS, Poder Local, Associação...)</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Matching NUT+TIP</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Score 0-100 • Prioridade: NUT (30pts) + TIP (20pts) + TIP Empresa (20pts)</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Database className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">RAG Interno</h4>
                        </div>
                        <p className="text-blue-100 text-sm">291 candidaturas históricas indexadas • Gemini File Search • Chat interno</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Building2 className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Sync Bitrix (Read)</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Leitura de empresas • Campos NUT, TIP, TIP_Empresa enriquecidos</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Tag className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Interface Limpa</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Lista de avisos • Filtros NUT/TIP • Marcação "Interessa/Não Interessa"</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-400" />
                        Export CSV para Bitrix
                    </h4>
                    <p className="text-blue-100">Para cada aviso, export de empresas matched • Import direto para segmentos/campanhas do Bitrix</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                    <p className="text-blue-200 text-sm flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-white">Timeline:</strong> 8 semanas • Formação incluída (2 sessões de 2h)</span>
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'fase2',
        title: 'FASE 2',
        subtitle: '€13.500 + IVA • Trigger: Candidatura Aprovada',
        icon: <Crown className="w-6 h-6" />,
        color: 'orange',
        badge: 'UPSELL',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-500/30 to-amber-500/30 border border-orange-400/50 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-orange-300" />
                        <div>
                            <p className="text-white font-semibold text-lg">O Futuro: Automatização Completa</p>
                            <p className="text-orange-200 text-sm">Trigger: 1ª candidatura aprovada usando a plataforma</p>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-200 text-sm">Investimento adicional</p>
                            <p className="text-3xl font-bold text-white">€13.500 <span className="text-lg font-normal text-orange-300">+ IVA</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-200 text-sm">Total do projeto</p>
                            <p className="text-3xl font-bold text-white">€18.000 <span className="text-lg font-normal text-orange-300">+ IVA</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <FileText className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">AI Writer</h4>
                        </div>
                        <p className="text-orange-100 text-sm">Gera rascunhos de memórias • ~50% economia de tempo • Baseado em 291 históricos</p>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">AI Critic</h4>
                        </div>
                        <p className="text-orange-100 text-sm">Revisão automática de candidaturas • Consistência • Sugestões de melhoria</p>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Building2 className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">Post-Award Management</h4>
                        </div>
                        <p className="text-orange-100 text-sm">Dashboard de projetos • Milestones • Alertas de reporting</p>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">Website Auto-Update</h4>
                        </div>
                        <p className="text-orange-100 text-sm">Sincronização automática de projetos aprovados • ~30 min/semana poupados</p>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">Marketing Mix AI</h4>
                        </div>
                        <p className="text-orange-100 text-sm">Recomendações de canais • Análise de performance de candidaturas</p>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">Sync Bitrix Write</h4>
                        </div>
                        <p className="text-orange-100 text-sm">Escrita automática no Bitrix • Atualização de empresas • Criação de tarefas</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-amber-400/30 rounded-xl p-4">
                    <p className="text-amber-200 text-sm flex items-start gap-2">
                        <Star className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Extra:</strong> Funcionalidades adicionais podem ser discutidas consoante as necessidades específicas.</span>
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'nao-incluido',
        title: 'Explicitamente NÃO Incluído',
        subtitle: 'O que foi cortado propositadamente',
        icon: <X className="w-6 h-6" />,
        color: 'red',
        content: (
            <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-5 mb-4">
                    <p className="text-red-200 text-sm">Estas funcionalidades foram removidas do scope baseadas no feedback do cliente:</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-red-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <X className="w-5 h-5 text-red-400" />
                            <h4 className="font-bold text-white">Dashboard com KPIs</h4>
                        </div>
                        <p className="text-red-200 text-sm">Razão: O Power BI do Bitrix já faz esta análise de dados</p>
                    </div>
                    <div className="bg-white/5 border border-red-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <X className="w-5 h-5 text-red-400" />
                            <h4 className="font-bold text-white">Chatbot Público</h4>
                        </div>
                        <p className="text-red-200 text-sm">Razão: "Para já está a pedir muito" — Fernando</p>
                    </div>
                    <div className="bg-white/5 border border-red-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <X className="w-5 h-5 text-red-400" />
                            <h4 className="font-bold text-white">Email Drip</h4>
                        </div>
                        <p className="text-red-200 text-sm">Razão: Atualmente feito fora do Bitrix, não é prioridade</p>
                    </div>
                    <div className="bg-white/5 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-white">RAG Interno mantido</h4>
                        </div>
                        <p className="text-emerald-200 text-sm">Apenas para uso interno da equipa TA Consulting</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3">Nota sobre Matching</h4>
                    <p className="text-blue-100 text-sm">
                        O algoritmo de matching prioriza <strong className="text-white">NUT + TIP</strong> (cobrindo 95% dos avisos).
                        O CAE é mantido como <em>fallback</em> para os 5% restantes que o mencionam explicitamente.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'retainer',
        title: 'Retainer',
        subtitle: 'Suporte pós-projeto',
        icon: <Shield className="w-6 h-6" />,
        color: 'cyan',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-5 mb-6">
                    <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Retainer mensal: €350 + IVA</h4>
                            <p className="text-cyan-100 text-sm">Inicia após conclusão da Fase 1 • Mínimo 3 meses • SLA: 3-5 dias úteis</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4">O que inclui:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-cyan-100">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Manutenção de scrapers:</strong> Adaptação quando portais mudam</span>
                            </li>
                            <li className="flex items-start gap-2 text-cyan-100">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Suporte:</strong> Dúvidas e problemas recorrentes</span>
                            </li>
                            <li className="flex items-start gap-2 text-cyan-100">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Backup diário:</strong> Dados seguros</span>
                            </li>
                        </ul>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-cyan-100">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Atualizações:</strong> Bug fixes e hotfixes</span>
                            </li>
                            <li className="flex items-start gap-2 text-cyan-100">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span><strong>Segurança:</strong> Patches aplicados</span>
                            </li>
                            <li className="flex items-start gap-2 text-cyan-100">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span><strong>1 reunião mensal:</strong> Revisão de operações</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                    <p className="text-blue-200 text-sm">
                        <strong className="text-white">Nota:</strong> O valor de €350/mês reflete o custo real de APIs e manutenção básica.
                        Para SLA mais apertado (24-48h), considerar retainer premium.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'timeline',
        title: 'Timeline Fase 1',
        subtitle: '8 semanas até deployment',
        icon: <Clock className="w-6 h-6" />,
        color: 'blue',
        content: (
            <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white">Sem 1-2</h4>
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Foundation</span>
                        </div>
                        <ul className="space-y-2 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Setup Prisma (NUT, TIP)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Scrapers PT2030 + PRR</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Bitrix read integration</li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white">Sem 3-4</h4>
                            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">Core</span>
                        </div>
                        <ul className="space-y-2 text-emerald-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> NUT/TIP extraction</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Matching engine</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> UI lista + filtros</li>
                        </ul>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white">Sem 5-6</h4>
                            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">RAG</span>
                        </div>
                        <ul className="space-y-2 text-amber-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Index 291 documentos</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Chat interface</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Export CSV</li>
                        </ul>
                    </div>
                    <div className="bg-violet-500/20 border border-violet-400/30 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white">Sem 7-8</h4>
                            <span className="bg-violet-500 text-white text-xs px-2 py-1 rounded-full">Deploy</span>
                        </div>
                        <ul className="space-y-2 text-violet-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> E2E testing</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Deploy produção</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Formação equipa</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'tech-specs',
        title: 'Especificações Técnicas',
        subtitle: 'Alterações necessárias',
        icon: <Wrench className="w-6 h-6" />,
        color: 'violet',
        content: (
            <div className="space-y-6">
                <div className="bg-violet-500/10 border border-violet-400/30 rounded-xl p-5 mb-4">
                    <p className="text-violet-200 text-sm">Alterações ao schema existentes para suportar NUT+TIP matching:</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Database className="w-5 h-5 text-violet-400" />
                            Prisma Schema - Empresa
                        </h4>
                        <pre className="bg-slate-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto">
{`model Empresa {
    // ... campos existentes ...
    nut        String?   // NUTS III (Norte, Centro, Alentejo, Algarve)
    tip        String?   // TIP (IPSS, Associação, Poder Central, Poder Local, Agricultura)
    tipEmpresa String?   // Sub-tipo (Politécnico, PME Inovadora, Startup, etc.)
    // ...
}`}
                        </pre>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Database className="w-5 h-5 text-violet-400" />
                            Prisma Schema - Aviso
                        </h4>
                        <pre className="bg-slate-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto">
{`model Aviso {
    // ... campos existentes ...
    nutsCompativeis     String[]   // Array de NUTs compatíveis
    tipCompativeis      String[]   // Array de TIPs compatíveis (95% dos avisos)
    caeCompativeis      String?    // CAE (só 5% dos avisos têm - fallback)
    // ...
}`}
                        </pre>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5 text-violet-400" />
                            Algoritmo de Matching - Nova Prioridade
                        </h4>
                        <pre className="bg-slate-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto">
{`// Score Total: 100 pontos
1. NUT Match:        30 pontos (ex: Norte == Norte)
2. TIP Match:        20 pontos (ex: IPSS == IPSS)
3. TIP Empresa:      20 pontos (ex: Politécnico == Politécnico)
4. CAE Match:        15 pontos (só se disponível - 5% casos)
5. Prazo adequado:   10 pontos
6. Montante ok:      5 pontos

// Threshold mínimo: 50 pontos para considerar match`}
                        </pre>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'faq',
        title: 'Perguntas Frequentes',
        subtitle: 'Dúvidas comuns respondidas',
        icon: <FileText className="w-6 h-6" />,
        color: 'violet',
        content: (
            <div className="space-y-4">
                {[
                    {
                        q: "Como funciona o modelo de 2 fases?",
                        a: "Fase 1 (€4.500): Setup do motor de scraping + matching. Pagamento único. Se uma candidatura for aprovada usando a plataforma, desbloqueia a Fase 2 (€13.500 adicional) para as funcionalidades avançadas. Total máximo: €18.000."
                    },
                    {
                        q: "Porquê NUT+TIP em vez de CAE?",
                        a: "Conforme confirmado pelo cliente, 95% dos avisos publicados NÃO mencionam CAE. A maioria usa NUT (região) e TIP (tipo de entidade) como critérios de elegibilidade. O matching CAE é mantido apenas como fallback para os 5% restantes."
                    },
                    {
                        q: "O que acontece se um scraper quebrar?",
                        a: "Report por email • Correção em 3-5 dias úteis (incluído no retainer) • Para SLA mais apertado (24-48h), considerar upgrade de retainer."
                    },
                    {
                        q: "Preciso de fornecer as 291 candidaturas?",
                        a: "Sim, para o RAG funcionar bem. Formatos aceites: Google Drive, upload direto (PDF, DOCX), ou exportação de outro sistema."
                    },
                    {
                        q: "A Fase 2 é obrigatória?",
                        a: "Não. A Fase 2 só é ativada se o cliente quiser expandir após uma candidatura aprovada. Se o projeto não atingir esse milestone, fica apenas pelo valor da Fase 1."
                    },
                    {
                        q: "Os preços incluem IVA?",
                        a: "Não. Todos os preços apresentados (setup e retainer mensal) são excluídos de IVA. O IVA à taxa em vigor será adicionado separadamente."
                    }
                ].map((faq, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5"
                    >
                        <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                        <p className="text-violet-200 text-sm">{faq.a}</p>
                    </motion.div>
                ))}
            </div>
        )
    }
];

const colorMap = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400', bgLight: 'bg-blue-500/20' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', bgLight: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', bgLight: 'bg-amber-500/20' },
    red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-400', bgLight: 'bg-red-500/20' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-400', bgLight: 'bg-violet-500/20' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400', bgLight: 'bg-cyan-500/20' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-400', bgLight: 'bg-orange-500/20' },
};

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionCard({ section, index }) {
    const colors = colorMap[section.color] || colorMap.blue;

    return (
        <motion.div
            id={section.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="mb-16 scroll-mt-24"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 ${colors.bgLight} border ${colors.border} rounded-xl flex items-center justify-center ${colors.text}`}>
                    {section.icon}
                </div>
                <div>
                    <span className={`text-sm font-semibold tracking-widest ${colors.text} uppercase`}>
                        {section.subtitle}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{section.title}</h2>
                </div>
                {section.badge && (
                    <span className={`ml-auto ${colors.bg} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                        {section.badge}
                    </span>
                )}
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
                {section.content}
            </div>
        </motion.div>
    );
}

function TableOfContents({ sections, activeSection }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 w-48 z-40"
        >
            <nav className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-xs font-semibold tracking-widest text-blue-300 uppercase mb-3">Índice</h3>
                <ul className="space-y-2">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                className={`text-sm py-1 px-2 rounded-lg block transition-colors ${
                                    activeSection === section.id
                                        ? 'bg-blue-500/30 text-white'
                                        : 'text-blue-200 hover:bg-white/5'
                                }`}
                            >
                                {section.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </motion.div>
    );
}

export default function PropostaTecnicaPage() {
    const [activeSection, setActiveSection] = useState('visao-geral');

    useEffect(() => {
        const handleScroll = () => {
            const sections = SECTIONS.map(s => document.getElementById(s.id));
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= 150) {
                        setActiveSection(SECTIONS[i].id);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        window.open('/docs/proposta-tecnica-v3.md', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 no-print">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/apresentacao-v6" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo-ta.png" alt="TA Consulting" width={40} height={40} priority />
                        <div>
                            <h1 className="text-base font-bold text-white">Proposta Técnica v3</h1>
                            <p className="text-xs text-slate-400">Janeiro 2026 • Modelo 2 Fases</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">MD</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative py-16 px-4 text-center no-print"
            >
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Image src="/logo-ta.png" alt="TA Consulting" width={80} height={80} priority />
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-5xl font-bold text-white mb-3"
                    >
                        Proposta Técnica v3
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-blue-200 mb-6"
                    >
                        Documento de Acompanhamento Comercial • Modelo 2 Fases
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <div className="flex items-center gap-2 text-white text-sm">
                            <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center justify-center">
                                <Star className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-blue-300">Fase 1</p>
                                <p className="font-semibold">€4.500 + €350/mês</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white text-sm">
                            <div className="w-10 h-10 bg-orange-500/20 border border-orange-400/30 rounded-lg flex items-center justify-center">
                                <Crown className="w-4 h-4 text-orange-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-orange-300">Fase 2</p>
                                <p className="font-semibold">€13.500 (opcional)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white text-sm">
                            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-emerald-300">Timeline</p>
                                <p className="font-semibold">8 semanas</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Table of Contents */}
            <TableOfContents sections={SECTIONS} activeSection={activeSection} />

            {/* Content */}
            <main className="relative max-w-4xl mx-auto px-4 pb-20">
                {SECTIONS.map((section, index) => (
                    <SectionCard key={section.id} section={section} index={index} />
                ))}
            </main>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-sm">
                        Este documento é confidencial e destina-se exclusivamente ao uso da TA Consulting.
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Janeiro 2026 • Versão 3.0</p>
                </div>
            </footer>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1.5cm; size: A4; }
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print { display: none !important; }
                    .fixed { display: none !important; }
                    header { display: none !important; }
                    footer { page-break-before: always; }

                    .bg-white\\/5 {
                        background: #f8f9fa !important;
                        border: 1px solid #dee2e6 !important;
                    }
                    .bg-blue-500\\/20 { background: #e3f2fd !important; }
                    .bg-emerald-500\\/20 { background: #e8f5e9 !important; }
                    .bg-amber-500\\/20 { background: #fff8e1 !important; }
                    .bg-cyan-500\\/20 { background: #e0f7fa !important; }
                    .bg-red-500\\/20 { background: #ffebee !important; }
                    .bg-violet-500\\/20 { background: #f3e5f5 !important; }
                    .bg-orange-500\\/20 { background: #fff3e0 !important; }

                    .gradient-to-r { background: none !important; }
                    .border { border-color: #dee2e6 !important; }
                    .border-white\\/10, .border-white\\/20 {
                        border-color: #dee2e6 !important;
                    }
                    .border-blue-400\\/30 { border-color: #90caf9 !important; }
                    .border-emerald-400\\/30 { border-color: #a5d6a7 !important; }
                    .border-amber-400\\/30 { border-color: #ffe082 !important; }
                    .border-cyan-400\\/30 { border-color: #80deea !important; }
                    .border-violet-400\\/30 { border-color: #b39ddb !important; }
                    .border-orange-400\\/30 { border-color: #ffcc80 !important; }

                    .text-white { color: #1a1a1a !important; }
                    .text-blue-100, .text-blue-200, .text-blue-300 { color: #0d47a1 !important; }
                    .text-emerald-100, .text-emerald-200, .text-emerald-300 { color: #1b5e20 !important; }
                    .text-amber-100, .text-amber-200, .text-amber-300 { color: #f57f17 !important; }
                    .text-cyan-100, .text-cyan-200, .text-cyan-300 { color: #006064 !important; }
                    .text-violet-100, .text-violet-200, .text-violet-300 { color: #4a148c !important; }
                    .text-orange-100, .text-orange-200, .text-orange-300 { color: #e65100 !important; }
                    .text-red-100, .text-red-200, .text-red-300 { color: #b71c1c !important; }
                    .text-slate-400, .text-slate-500 { color: #666 !important; }

                    .from-slate-900, .via-blue-950, .to-slate-900 { background: white !important; }

                    .mb-16 { page-break-inside: avoid; margin-bottom: 1rem !important; }
                    .space-y-6 > * { page-break-inside: avoid; }

                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                }
            `}</style>
        </div>
    );
}
