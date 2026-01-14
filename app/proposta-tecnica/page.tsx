'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Printer, FileText, Check, X, Crown, Star, Award, Clock, Shield, Target, Globe, Database, Lightbulb, AlertTriangle, ChevronRight, Users, TrendingUp, Play, Mail, Building2, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================================
// PROPOSTA COMERCIAL v6 - Focada em VALOR para o CLIENTE
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
                    Do Aviso à Lead em <span className="text-blue-400">Minutos</span>
                </h1>
                <p className="text-xl text-blue-200 mb-8 max-w-2xl">
                    Proposta de implementação da plataforma de inteligência para captação de fundos europeus
                </p>
                <div className="flex items-center gap-6 text-blue-100">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">24.000+</div>
                        <div className="text-xs">Empresas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">291</div>
                        <div className="text-xs">Candidaturas Históricas</div>
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
        id: 'problema',
        title: 'O Desafio',
        subtitle: 'O que acontece hoje',
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
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">O Custo do Processo Manual</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-100">
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400" />
                            <span>Avisos perdidos por delay</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400" />
                            <span>Empresas não qualificadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400" />
                            <span>Tempo gasto em tarefas repetitivas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400" />
                            <span>Conhecimento subutilizado (291 candidaturas)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400" />
                            <span>95% dos avisos sem CAE - matching falha</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400" />
                            <span>Excel manual todas as semanas</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'fase1',
        title: 'FASE 1 - O Motor',
        subtitle: '€4.500 + IVA • Entrega em 10 semanas',
        badge: 'BASE',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/30 to-blue-600/30 border border-blue-400/50 rounded-xl p-6 mb-6">
                    <div className="text-4xl font-bold text-white mb-2">€4.500<span className="text-lg font-normal text-blue-300"> + IVA</span></div>
                    <p className="text-blue-100 text-lg">Pagamento único • Setup completo em 10 semanas</p>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">O que recebe:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Database className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Avisos em Tempo Real</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Todos os avisos de PT2030, PRR e PEPAC centralizados. Atualizados a cada 6h.</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Matching NUT+TIP</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Cruza avisos com 24.000 empresas usando NUT (região) e TIP (tipo de entidade). Cobertura de 95%.</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">RAG - Chat com 291 Candidaturas</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Pergunte anything sobre candidaturas anteriores. O sistema encontra respostas nas 291 históricas.</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Download className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Export CSV para Bitrix</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Um clique exporta a lista de empresas qualificadas para importar em segmentos Bitrix.</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-400/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <h4 className="font-bold text-white">AI Writer V1 (Básico) - INCLUÍDO</h4>
                    </div>
                    <p className="text-violet-200 text-sm mb-3">Rascunhos automáticos baseados nas 291 candidaturas históricas</p>
                    <ul className="space-y-1 text-blue-100 text-sm">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Upload de aviso (URL ou PDF)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Seleção de empresa do Bitrix</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Geração de rascunho simples</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Respeito de limites de caracteres</li>
                    </ul>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Resultado Esperado
                    </h3>
                    <p className="text-emerald-100">De horas de pesquisa manual a minutos. Mais leads, menos trabalho manual, oportunidades perdidas = 0. Primeiros rascunhos com IA em vez de começar do zero.</p>
                </div>
            </div>
        )
    },
    {
        id: 'fase2',
        title: 'FASE 2 - Evolução Natural',
        subtitle: '€13.500 + IVA • Só se candidatura aprovada',
        badge: 'UPSELL',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-500/30 to-amber-500/30 border border-orange-400/50 rounded-xl p-6 mb-6">
                    <div className="text-3xl font-bold text-white mb-2">€13.500<span className="text-lg font-normal text-orange-300"> + IVA</span></div>
                    <p className="text-orange-100 text-lg">Adicional à Fase 1 • Apenas se 1ª candidatura aprovada</p>
                    <div className="mt-4 pt-4 border-t border-orange-400/30">
                        <p className="text-orange-200 text-sm">TOTAL DO PROJETO: <span className="text-2xl font-bold text-white"> €18.000 + IVA</span></p>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">Evolução do AI Writer e novas automações:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-400/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            <h4 className="font-bold text-white">AI Writer V2 (Premium)</h4>
                        </div>
                        <p className="text-violet-200 text-sm mb-2">Evolução do V1 com templates avançados</p>
                        <ul className="space-y-1 text-orange-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Templates por tipo de aviso</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Validação de regras (caracteres)</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> AI Critic (revisão automática)</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Export Word/PDF</li>
                        </ul>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">AI Critic</h4>
                        </div>
                        <p className="text-orange-100 text-sm">Revisão automática que verifica consistência, sugere melhorias e compara com candidaturas aprovadas anteriormente.</p>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">Marketing Mix AI</h4>
                        </div>
                        <p className="text-orange-100 text-sm mb-2">Substitui o Excel manual do Fernando</p>
                        <ul className="space-y-1 text-orange-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Sugestão automática de canais</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Análise de performance</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Flag "em campanha" automático</li>
                        </ul>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">Website Auto-Update</h4>
                        </div>
                        <p className="text-orange-100 text-sm mb-2">Elimina trabalho manual da Paula</p>
                        <ul className="space-y-1 text-orange-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Sync automático de avisos</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> Atualização de datas em tempo real</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-orange-400" /> A Paula apenas valida</li>
                        </ul>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Database className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">Bitrix Write Integration</h4>
                        </div>
                        <p className="text-orange-100 text-sm">De read-only para escrita direta: cria segmentos, atualiza empresas, sync bidirecional. Fim do CSV import.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'modelo',
        title: 'Modelo de 2 Fases',
        subtitle: 'Baixo risco, alinhado com sucesso',
        content: (
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Fase 1 */}
                    <div className="bg-blue-500/20 border-2 border-blue-400 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">1</span>
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
                            <p className="text-blue-100"><strong className="text-white">Entregamos:</strong></p>
                            <ul className="space-y-2 text-sm text-blue-100">
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />Motor de scraping + matching</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />Interface para filtrar e avaliar avisos</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />Chat interno com 291 candidaturas</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />AI Writer V1 (rascunhos básicos)</li>
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
                    <div className="bg-orange-500/20 border-2 border-orange-400 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">2</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">FASE 2</h3>
                                    <p className="text-orange-200 text-sm">Se aprovado</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">€13.500</div>
                                <div className="text-orange-300 text-sm">+ IVA</div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <p className="text-orange-100"><strong className="text-white">Entregamos:</strong></p>
                            <ul className="space-y-2 text-sm text-orange-100">
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />AI Writer V2 (templates + validação)</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />AI Critic (revisão automática)</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />Marketing Mix AI</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />Website auto-update</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />Bitrix Write Integration</li>
                            </ul>
                        </div>

                        <div className="bg-orange-900/50 rounded-lg p-3 text-center">
                            <p className="text-orange-200 text-sm"><strong>Trigger:</strong> 1ª candidatura aprovada</p>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Risco Compartilhado
                    </h3>
                    <p className="text-emerald-100">Se a candidatura não for aprovada, fica apenas pelo valor da Fase 1 (€4.500). A Fase 2 só é ativada se o projeto tiver sucesso.</p>
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
                        <p className="text-blue-100 text-sm">Scraping + Bitrix integration</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-blue-300 mb-2">Semana 3-4</div>
                        <p className="text-blue-100 text-sm">Matching NUT/TIP + UI</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-blue-300 mb-2">Semana 5-7</div>
                        <p className="text-blue-100 text-sm">RAG + AI Writer V1</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                        <div className="text-sm font-semibold text-blue-300 mb-2">Semana 8-9</div>
                        <p className="text-blue-100 text-sm">Testes end-to-end</p>
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
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 7: AI Writer V1 funcional</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 10: Go-live + formação</li>
                    </ul>
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
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-5 mb-4">
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
        id: 'user-journey',
        title: 'User Journey',
        subtitle: 'Como funciona na prática',
        content: (
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Fluxo Típico - Do Aviso ao Lead</h3>
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
                                <p className="text-blue-100 text-sm">Sistema cruza NUT e TIP do aviso com 24.000 empresas. Mostra: "50 empresas compatíveis".</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Fernando Avalia</h4>
                                <p className="text-blue-100 text-sm">Vê lista, filtra por "Interessa", marca para campanha. Clica "Export CSV".</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">4</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">AI Writer V1 (Fase 1)</h4>
                                <p className="text-blue-100 text-sm">Fernando seleciona aviso + empresa. Sistema gera rascunho baseado em 291 candidaturas históricas. Copia e cola.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">5</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Import para Bitrix</h4>
                                <p className="text-blue-100 text-sm">CSV importado para segmento. Campanha criada. Leads contactados.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-5">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <X className="w-5 h-5 text-red-400" />
                            Antes (Manual)
                        </h3>
                        <ul className="space-y-2 text-sm text-red-200">
                            <li>• Pesquisar em 3 portais manualmente</li>
                            <li>• Verificar cada aviso individualmente</li>
                            <li>• Cruzar com Excel mentalmente</li>
                            <li>• Escrever candidatura do zero</li>
                            <li>• Copy-paste para Bitrix</li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Check className="w-5 h-5 text-emerald-400" />
                            Depois (Automatizado)
                        </h3>
                        <ul className="space-y-2 text-sm text-emerald-200">
                            <li>• Avisos aparecem automaticamente</li>
                            <li>• Matching mostra empresas qualificadas</li>
                            <li>• 1 clique para CSV</li>
                            <li>• AI Writer gera rascunho</li>
                            <li>• Foco em fechar negócio</li>
                        </ul>
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
                <p className="text-xl text-blue-200 mb-8">Estamos prontos para esclarecer dúvidas e ajustar a proposta às vossas necessidades.</p>

                <div className="flex gap-4 justify-center">
                    <a href="mailto:geral@taconsulting.pt?subject=Proposta%20Platform%20v6" className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Contactar
                    </a>
                    <Link href="/apresentacao-v6" className="bg-white/10 hover:bg-white/20 border border-white/30 px-8 py-4 rounded-lg text-white font-medium transition-colors">
                        Voltar à Apresentação
                    </Link>
                </div>
            </div>
        )
    }
];

const colorMap: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400', bgLight: 'bg-blue-500/20' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', bgLight: 'bg-emerald-500/20' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-400', bgLight: 'bg-orange-500/20' },
    red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-400', bgLight: 'bg-red-500/20' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400', bgLight: 'bg-cyan-500/20' },
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
                <div className={`w-14 h-14 ${colors.bgLight} border ${colors.border} rounded-xl flex items-center justify-center ${colors.text}`}>
                    {section.icon}
                </div>
                <div>
                    {section.subtitle && (
                        <span className={`text-sm font-semibold tracking-widest ${colors.text} uppercase`}>
                            {section.subtitle}
                        </span>
                    )}
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

    const handleDownload = () => {
        // Could generate a PDF or open a markdown version
        window.print();
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
                            <h1 className="text-base font-bold text-white">Proposta Comercial v6</h1>
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
                    .bg-orange-500\\/20 { background: #fff3e0 !important; }
                    .bg-cyan-500\\/20 { background: #e0f7fa !important; }
                    .bg-red-500\\/20 { background: #ffebee !important; }
                    .border { border-color: #dee2e6 !important; }
                    .text-white { color: #1a1a1a !important; }
                    .text-blue-100, .text-blue-200, .text-blue-300 { color: #0d47a1 !important; }
                    .text-emerald-100, .text-emerald-200, .text-emerald-300 { color: #1b5e20 !important; }
                    .text-orange-100, .text-orange-200, .text-orange-300 { color: #e65100 !important; }
                    .text-cyan-100, .text-cyan-200, .text-cyan-300 { color: #006064 !important; }
                    .text-slate-400, .text-slate-500 { color: #666 !important; }
                    .from-slate-900, .via-blue-950, .to-slate-900 { background: white !important; }
                    .mb-16 { page-break-inside: avoid; margin-bottom: 1rem !important; }
                    .space-y-6 > * { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
