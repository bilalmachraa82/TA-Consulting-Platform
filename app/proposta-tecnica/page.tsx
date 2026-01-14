'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, FileText, Check, Crown, Clock, Shield, Target, Globe, Database, TrendingUp, Mail, Sparkles, Zap, ChevronRight, Award, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================================
// PROPOSTA COMERCIAL v6 - FOCADA EM VALOR PARA SÓCIOS
// ============================================================================

const SECTIONS: Array<{
    id: string;
    title: string;
    subtitle: string;
    content: React.ReactNode;
    badge?: string;
    color?: string;
}> = [
    {
        id: 'hero',
        title: 'Proposta Comercial v6',
        subtitle: 'Plataforma de Inteligência Europeia',
        content: (
            <div className="flex flex-col justify-center items-center h-full text-center px-8">
                <div className="mb-6">
                    <Image src="/logo-ta.png" alt="TA Consulting" width={80} height={80} priority />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Transforme Avisos em <span className="text-amber-400">Candidaturas</span>
                </h1>
                <p className="text-xl text-blue-200 mb-8 max-w-2xl">
                    Plataforma de inteligência que identifica oportunidades e qualifica leads automaticamente
                </p>
                <div className="flex items-center gap-8 text-blue-100">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">24k+</div>
                        <div className="text-xs">Empresas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">291</div>
                        <div className="text-xs">Candidaturas de Sucesso</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">10</div>
                        <div className="text-xs">Semanas</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'resumo',
        title: 'Resumo Executivo',
        subtitle: 'O que propomos',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/30 to-blue-600/30 border-2 border-blue-400/50 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">O Problema</h3>
                    <p className="text-blue-100 text-lg">A TA Consulting tem 24.000 empresas na base de dados, mas saber quem são não significa saber quem são leads qualificados para um aviso específico. Hoje, o processo é manual: pesquisa em múltiplos portais, cruzamento de elegibilidades, e muito tempo perdido em tarefas repetitivas.</p>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/30 to-green-500/30 border-2 border-emerald-400/50 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">A Solução</h3>
                    <p className="text-emerald-100 text-lg">Uma plataforma que identifica automaticamente avisos de fundos europeus, qualifica empresas compatíveis, e usa as 291 candidaturas históricas para gerar primeiros rascunhos. Do aviso ao lead em minutos, não horas.</p>
                </div>

                <div className="bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border-2 border-amber-400/50 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">O Valor</h3>
                    <p className="text-amber-100 text-lg">Primeiro a contactar = maior probabilidade de fechar negócio. A equipa foca-se em construir relacionamentos e fechar candidaturas, não em procurar oportunidades.</p>
                </div>
            </div>
        )
    },
    {
        id: 'fase1',
        title: 'Fase 1 - Plataforma Core',
        subtitle: '€4.500 + IVA • 10 Semanas',
        badge: 'BASE',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/30 to-blue-600/30 border-2 border-blue-400/50 rounded-xl p-6">
                    <div className="text-5xl font-bold text-white mb-2">€4.500<span className="text-xl font-normal text-blue-300"> + IVA</span></div>
                    <p className="text-blue-100 text-lg">Pagamento único • Entrega em 10 semanas</p>
                    <div className="mt-4 pt-4 border-t border-blue-400/30">
                        <p className="text-blue-200 text-sm">Retainer: €350/mês + IVA (mínimo 3 meses)</p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">O que recebe:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-6 h-6 text-blue-400" />
                            <h4 className="font-bold text-white text-lg">Avisos em Tempo Real</h4>
                        </div>
                        <p className="text-blue-100 mb-2">Todos os avisos de fundos europeus num só lugar</p>
                        <ul className="space-y-1 text-blue-200 text-sm">
                            <li>• Portugal 2030</li>
                            <li>• PRR - Plano de Recuperação</li>
                            <li>• PEPAC</li>
                            <li>• Atualizado a cada 6h</li>
                        </ul>
                    </div>

                    <div className="bg-emerald-500/20 border-2 border-emerald-400/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-6 h-6 text-emerald-400" />
                            <h4 className="font-bold text-white text-lg">Matching Inteligente</h4>
                        </div>
                        <p className="text-emerald-100 mb-2">Cruza cada aviso com empresas qualificadas</p>
                        <ul className="space-y-1 text-emerald-200 text-sm">
                            <li>• Por região (Norte, Centro, Lisboa...)</li>
                            <li>• Por tipo (IPSS, Associação, Poder Local...)</li>
                            <li>• Mostra: "50 empresas qualificadas"</li>
                            <li>• Export 1-clique para Bitrix</li>
                        </ul>
                    </div>

                    <div className="bg-violet-500/20 border-2 border-violet-400/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Database className="w-6 h-6 text-violet-400" />
                            <h4 className="font-bold text-white text-lg">Conhecimento da TA</h4>
                        </div>
                        <p className="text-violet-100 mb-2">291 candidaturas históricas sempre disponíveis</p>
                        <ul className="space-y-1 text-violet-200 text-sm">
                            <li>• Pergunte em linguagem natural</li>
                            <li>• Encontra respostas nas candidaturas</li>
                            <li>• Exemplos de linguagem aprovada</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/20 border-2 border-violet-400/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-6 h-6 text-violet-400" />
                            <h4 className="font-bold text-white text-lg">AI Writer Incluído</h4>
                            <span className="ml-auto text-xs bg-violet-500 px-2 py-1 rounded text-white text-xs font-bold">NOVO</span>
                        </div>
                        <p className="text-violet-100 mb-2">Primeiro rascunho gerado automaticamente</p>
                        <ul className="space-y-1 text-violet-200 text-sm">
                            <li>• Upload do aviso (URL ou PDF)</li>
                            <li>• Seleciona empresa do Bitrix</li>
                            <li>• Rascunho baseado em 291 candidaturas</li>
                            <li>• Respeita limites de caracteres</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-2 border-emerald-400/50 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Resultado Esperado
                    </h3>
                    <p className="text-emerald-100 text-lg">De horas de pesquisa a minutos. Mais candidaturas, menos trabalho manual. O foco passa a ser fechar negócios.</p>
                </div>
            </div>
        )
    },
    {
        id: 'fase2',
        title: 'Fase 2 - Premium Expansion',
        subtitle: '€13.500 + IVA • Se 1ª candidatura aprovada',
        badge: 'PREMIUM',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border-2 border-amber-400/50 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Crown className="w-10 h-10 text-amber-400" />
                        <div>
                            <p className="text-3xl font-bold text-white">€13.500<span className="text-lg font-normal text-amber-300"> + IVA</span></p>
                            <p className="text-amber-200 text-sm">Adicional à Fase 1 • Apenas se aprovado</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-400/30">
                        <p className="text-amber-200">TOTAL DO PROJETO: <span className="text-2xl font-bold text-white"> €18.000 + IVA</span></p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">Evolução do AI Writer e Automação Avançada:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/20 border-2 border-violet-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            AI Writer Premium
                        </h4>
                        <p className="text-violet-200 text-sm mb-2">Evolução do V1</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li>• Templates por tipo de aviso</li>
                            <li>• Validação automática de regras</li>
                            <li>• Revisão automática (AI Critic)</li>
                            <li>• Export para Word/PDF</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/30 to-green-500/20 border-2 border-emerald-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Marketing Mix AI
                        </h4>
                        <p className="text-emerald-200 text-sm mb-2">Automatiza decisões de campanha</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li>• Sugere canais (email, Facebook...)</li>
                            <li>• Análise de performance</li>
                            <li>• Identifica segmentos propensos</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-2 border-blue-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            Website Auto-Update
                        </h4>
                        <p className="text-blue-200 text-sm mb-2">Sincroniza automaticamente</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li>• Novos avisos no site automaticamente</li>
                            <li>• Atualização de datas em tempo real</li>
                            <li>• Apenas validação necessária</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-2 border-amber-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Database className="w-5 h-5 text-amber-400" />
                            Integração Bitrix Completa
                        </h4>
                        <p className="text-amber-200 text-sm mb-2">Escrita direta no Bitrix</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li>• Cria segmentos automaticamente</li>
                            <li>• Atualiza empresas</li>
                            <li>• Fim do import/export manual</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Risco Zero Partilhado
                    </h4>
                    <p className="text-emerald-100">Se a candidatura não for aprovada, ficam apenas pelo valor da Fase 1. Partilhamos o risco do sucesso.</p>
                </div>
            </div>
        )
    },
    {
        id: 'modelo',
        title: 'Modelo de Duas Fases',
        subtitle: 'Baixo risco, alinhado com sucesso',
        content: (
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Fase 1 */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-xl">1</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">FASE 1</h3>
                                    <p className="text-blue-200 text-sm">Imediato</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">€4.500</div>
                                <div className="text-blue-300 text-sm">+ IVA</div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <p className="text-blue-100 font-semibold">Entregamos:</p>
                            <ul className="space-y-2 text-sm text-blue-100">
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />Avisos em tempo real (PT2030, PRR, PEPAC)</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />Matching inteligente por região e tipo</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />Chat com 291 candidaturas históricas</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />AI Writer para rascunhos automáticos</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />Export CSV para Bitrix</li>
                            </ul>
                        </div>

                        <div className="text-sm text-blue-200">
                            <strong className="text-white">Timeline:</strong> 10 semanas
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                        <Crown className="w-8 h-8 text-amber-400" />
                    </div>

                    {/* Fase 2 */}
                    <div className="bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 border-2 border-amber-400 rounded-xl p-6 relative">
                        <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            PREMIUM
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-amber-600 font-bold text-xl">2</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">FASE 2</h3>
                                    <p className="text-amber-100 text-sm">Se aprovado</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">€13.500</div>
                                <div className="text-amber-200 text-sm">+ IVA</div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <p className="text-amber-100 font-semibold">Entregamos:</p>
                            <ul className="space-y-2 text-sm text-amber-100">
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />AI Writer Premium (templates + validação)</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Marketing Mix AI</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Website auto-update</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Integração Bitrix completa</li>
                            </ul>
                        </div>

                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                            <p className="text-amber-200 text-sm"><strong>Trigger:</strong> 1ª candidatura aprovada</p>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Vantagem do Modelo
                    </h3>
                    <p className="text-emerald-100">Partilhamos o risco do sucesso. Se a candidatura não for aprovada, fica apenas pelo valor da Fase 1. A Fase 2 só é ativada se o projeto tiver sucesso.</p>
                </div>
            </div>
        )
    },
    {
        id: 'timeline',
        title: 'Timeline',
        subtitle: '10 semanas até Go-Live',
        content: (
            <div className="space-y-6">
                <div className="grid md:grid-cols-5 gap-3">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-blue-300 mb-2">Semana 1-2</div>
                        <p className="text-blue-100 text-sm">Scraping + Bitrix</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-blue-300 mb-2">Semana 3-4</div>
                        <p className="text-blue-100 text-sm">Matching + UI</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-blue-300 mb-2">Semana 5-7</div>
                        <p className="text-blue-100 text-sm">RAG + AI Writer</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-blue-300 mb-2">Semana 8-9</div>
                        <p className="text-blue-100 text-sm">Testes</p>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-emerald-300 mb-2">Semana 10</div>
                        <p className="text-emerald-100 text-sm">Deploy + Formação</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-3">Milestones</h3>
                    <ul className="space-y-2 text-sm text-blue-100">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 2: Primeira demo funcional</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 4: Matching operacional</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 7: AI Writer funcional</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 10: Go-live + formação</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'user-journey',
        title: 'Como Funciona',
        subtitle: 'Fluxo típico do dia a dia',
        content: (
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Do Aviso ao Lead em Minutos</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Aviso Publicado</h4>
                                <p className="text-blue-100 text-sm">Portugal 2030, PRR ou PEPAC publica um novo aviso. Sistema detecta em até 6h.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Matching Automático</h4>
                                <p className="text-blue-100 text-sm">Sistema cruza região e tipo do aviso com 24.000 empresas. Mostra: "50 empresas qualificadas".</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Avaliação Rápida</h4>
                                <p className="text-blue-100 text-sm">Vê lista, filtra os interessados, marca para campanha. Um clique para exportar CSV.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">4</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">AI Writer Gera Rascunho</h4>
                                <p className="text-blue-100 text-sm">Seleciona aviso + empresa. Sistema gera rascunho baseado em 291 candidaturas de sucesso.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">5</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Leads Qualificados</h4>
                                <p className="text-blue-100 text-sm">CSV importado para Bitrix. Campanha criada. Equipa focada em contactar e fechar.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-5">
                        <h3 className="font-bold text-white mb-3">Antes</h3>
                        <ul className="space-y-2 text-sm text-red-200">
                            <li>• Pesquisa manual em 3+ portais</li>
                            <li>• Cruzamento manual de elegibilidades</li>
                            <li>• Candidaturas escritas do zero</li>
                            <li>• Horas de trabalho repetitivo</li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <h3 className="font-bold text-white mb-3">Depois</h3>
                        <ul className="space-y-2 text-sm text-emerald-200">
                            <li>• Avisos aparecem automaticamente</li>
                            <li>• Matching instantâneo</li>
                            <li>• Primeiro rascunho com IA</li>
                            <li>• Foco em fechar negócios</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'suporte',
        title: 'Suporte Contínuo',
        subtitle: 'Após as 10 semanas',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-5">
                    <div className="text-2xl font-bold text-white mb-2">€350 <span className="text-lg font-normal text-cyan-300">+ IVA / mês</span></div>
                    <p className="text-cyan-100">Manutenção, suporte e atualizações</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-4">Inclui:</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-cyan-100">
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Manutenção dos scrapers</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Suporte técnico</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Backup diário</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Atualizações e correções</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Reunião mensal de revisão</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'cta',
        title: 'Próximos Passos',
        subtitle: 'Começamos hoje?',
        content: (
            <div className="flex flex-col justify-center items-center h-full px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Vamos Conversar?</h2>
                <p className="text-xl text-blue-200 mb-8">Estamos disponíveis para esclarecer dúvidas.</p>

                <div className="flex gap-4 justify-center">
                    <a href="mailto:geral@taconsulting.pt?subject=Proposta%20Platform%20v6" className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Contactar
                    </a>
                    <Link href="/apresentacao-v6" className="bg-white/10 hover:bg-white/20 border border-white/30 px-8 py-4 rounded-lg text-white font-medium transition-colors">
                        Ver Apresentação
                    </Link>
                </div>
            </div>
        )
    }
];

const colorMap: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400', bgLight: 'bg-blue-500/20' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', bgLight: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', bgLight: 'bg-amber-500/20' },
    red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-400', bgLight: 'bg-red-500/20' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400', bgLight: 'bg-cyan-500/20' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-400', bgLight: 'bg-violet-500/20' },
};

function SectionCard({ section, index }: { section: typeof SECTIONS[0]; index: number }) {
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
                {section.badge && (
                    <span className={`${colors.bg} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                        {section.badge}
                    </span>
                )}
                {section.subtitle && (
                    <span className={`text-sm font-semibold tracking-widest ${colors.text} uppercase`}>
                        {section.subtitle}
                    </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-white">{section.title}</h2>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
                {section.content}
            </div>
        </motion.div>
    );
}

export default function PropostaTecnicaPage() {
    const [activeSection, setActiveSection] = useState('hero');

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl"></div>
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
                            <h1 className="text-base font-bold text-white">Proposta v6</h1>
                            <p className="text-xs text-slate-400">Janeiro 2026</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 no-print"
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
                {SECTIONS[0].content}
            </motion.section>

            {/* Content */}
            <main className="relative max-w-4xl mx-auto px-4 pb-20">
                {SECTIONS.slice(1).map((section, index) => (
                    <SectionCard key={section.id} section={section} index={index} />
                ))}
            </main>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-sm">
                        Este documento é confidencial e destina-se exclusivamente ao uso da TA Consulting.
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Janeiro 2026 • Versão 6.0</p>
                </div>
            </footer>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1.5cm; size: A4; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .fixed { display: none !important; }
                    header { display: none !important; }
                    footer { page-break-before: always; }
                    .bg-white\\/5 { background: #f8f9fa !important; border: 1px solid #dee2e6 !important; }
                    .bg-blue-500\\/20 { background: #e3f2fd !important; }
                    .bg-emerald-500\\/20 { background: #e8f5e9 !important; }
                    .bg-amber-500\\/20 { background: #fff8e1 !important; }
                    .bg-cyan-500\\/20 { background: #e0f7fa !important; }
                    .bg-red-500\\/20 { background: #ffebee !important; }
                    .bg-violet-500\\/20 { background: #f3e5f5 !important; }
                    .border { border-color: #dee2e6 !important; }
                    .text-white { color: #1a1a1a !important; }
                    .text-blue-100, .text-blue-200, .text-blue-300 { color: #0d47a1 !important; }
                    .text-emerald-100, .text-emerald-200, .text-emerald-300 { color: #1b5e20 !important; }
                    .text-amber-100, .text-amber-200, .text-amber-300 { color: #f57f17 !important; }
                    .text-violet-100, .text-violet-200, .text-violet-300 { color: #4a148c !important; }
                    .text-cyan-100, .text-cyan-200, .text-cyan-300 { color: #006064 !important; }
                    .from-slate-900, .via-blue-950, .to-slate-900 { background: white !important; }
                    .mb-16 { page-break-inside: avoid; margin-bottom: 1rem !important; }
                    .space-y-6 > * { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
