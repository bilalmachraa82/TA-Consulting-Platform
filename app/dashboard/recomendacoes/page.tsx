
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, TrendingUp, AlertCircle, Calendar, Euro, MapPin, Users, Building2, Target, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function RecomendacoesPage() {
  // Safe useSession - works even without SessionProvider
  let session: any = null;
  let status: string = 'unauthenticated';
  try {
    const sessionData = useSession();
    session = sessionData?.data;
    status = sessionData?.status || 'authenticated'; // Default to authenticated for demo
  } catch {
    // If SessionProvider not found, assume authenticated for demo
    status = 'authenticated';
  }
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>('');
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analisesPorAviso, setAnalisesPorAviso] = useState<Record<string, any>>({});
  const [loadingAnalise, setLoadingAnalise] = useState<string | null>(null);
  const [briefsPorAviso, setBriefsPorAviso] = useState<Record<string, any>>({});
  const [loadingBrief, setLoadingBrief] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      carregarEmpresas();
    }
  }, [status]);

  const carregarEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas');
      if (!response.ok) throw new Error('Erro ao carregar empresas');
      const data = await response.json();
      // Handle both {empresas: [...]} and direct array formats
      const empresasList = Array.isArray(data) ? data : (data.empresas || []);
      setEmpresas(empresasList);

      if (empresasList.length > 0) {
        setEmpresaSelecionada(empresasList[0].id);
        carregarRecomendacoes(empresasList[0].id);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar empresas');
    }
  };

  const carregarRecomendacoes = async (empresaId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recomendacoes?empresaId=${empresaId}&limite=20&scoreMinimo=30`);
      if (!response.ok) throw new Error('Erro ao carregar recomendações');
      const data = await response.json();
      setRecomendacoes(data.recomendacoes || []);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar recomendações');
    } finally {
      setLoading(false);
    }
  };

  const handleEmpresaChange = (empresaId: string) => {
    setEmpresaSelecionada(empresaId);
    setAnalisesPorAviso({});
    setBriefsPorAviso({});
    carregarRecomendacoes(empresaId);
  };

  const gerarAnaliseDetalhada = async (avisoId: string) => {
    setLoadingAnalise(avisoId);
    try {
      const response = await fetch('/api/recomendacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: empresaSelecionada,
          avisoId
        })
      });

      if (!response.ok) throw new Error('Erro ao gerar análise');
      const data = await response.json();
      setAnalisesPorAviso((prev) => ({ ...prev, [avisoId]: data }));
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao gerar análise detalhada');
    } finally {
      setLoadingAnalise(null);
    }
  };

  const gerarBriefIA = async (avisoId: string) => {
    setLoadingBrief(avisoId);
    try {
      const response = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: empresaSelecionada,
          avisoId,
        }),
      });

      if (!response.ok) throw new Error('Erro ao gerar brief');
      const data = await response.json();
      setBriefsPorAviso((prev) => ({ ...prev, [avisoId]: data }));
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao gerar brief IA');
    } finally {
      setLoadingBrief(null);
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-green-500';
      case 'média': return 'bg-yellow-500';
      case 'baixa': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'default';
      case 'média': return 'secondary';
      case 'baixa': return 'outline';
      default: return 'outline';
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Recomendações Inteligentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Avisos personalizados com base no perfil da empresa
          </p>
        </div>

        <div className="w-[300px]">
          <Select value={empresaSelecionada} onValueChange={handleEmpresaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar empresa" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas */}
      {recomendacoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number text-green-400">
                {recomendacoes.filter(r => r.prioridade === 'alta').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Compatibilidade &gt; 80%
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Média Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number text-amber-400">
                {recomendacoes.filter(r => r.prioridade === 'média').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Compatibilidade 60-80%
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number">
                {recomendacoes.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Avisos compatíveis
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Recomendações */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : recomendacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma recomendação disponível</p>
            <p className="text-sm text-muted-foreground mt-2">
              Não há avisos compatíveis com o perfil da empresa no momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recomendacoes.map((recomendacao) => {
            const { aviso, score, razoes, alertas, prioridade, elegibilidade } = recomendacao;
            const diasRestantes = Math.ceil((new Date(aviso.dataFimSubmissao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={aviso.id} className="card-premium hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPrioridadeBadge(prioridade)}>
                          {prioridade.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{aviso.portal}</Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{aviso.nome}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {aviso.descricao}
                      </CardDescription>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold text-primary">
                          {score}%
                        </span>
                      </div>
                      <Progress value={score} className="w-20" />
                      {elegibilidade?.criterios?.length > 0 && (() => {
                        const aval = elegibilidade.criterios.filter((c: { estado: string }) => c.estado !== 'desconhecido').length;
                        return <span className="text-[10px] text-muted-foreground">{aval} de {elegibilidade.criterios.length} critérios</span>;
                      })()}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Informações do Aviso */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Prazo</p>
                        <p className="font-medium">{diasRestantes} dias</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Montante</p>
                        <p className="font-medium">{aviso.montanteMaximo ? `€${aviso.montanteMaximo.toLocaleString()}` : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Região</p>
                        <p className="font-medium">{aviso.regiao || 'Nacional'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Programa</p>
                        <p className="font-medium">{aviso.programa || 'Geral'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Análise de Elegibilidade EXPLICÁVEL (semáforo por critério) */}
                  {elegibilidade?.criterios?.length > 0 ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Análise de elegibilidade</p>
                        {(() => {
                          const v = elegibilidade.veredicto;
                          const cfg: Record<string, { label: string; cls: string }> = {
                            elegivel: { label: 'Elegível', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
                            elegivel_com_reservas: { label: 'Elegível com reservas', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
                            provavelmente_nao: { label: 'Provavelmente não elegível', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
                            dados_insuficientes: { label: 'Dados insuficientes', cls: 'bg-muted text-muted-foreground border-border' },
                          };
                          const c = cfg[v] ?? cfg.dados_insuficientes;
                          return <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${c.cls}`}>{c.label}</span>;
                        })()}
                      </div>
                      <ul className="space-y-1.5">
                        {elegibilidade.criterios.map((c: { dimensao: string; estado: string; explicacao: string }, i: number) => {
                          const dot: Record<string, string> = {
                            ok: 'bg-green-500', atencao: 'bg-yellow-500', falha: 'bg-red-500', desconhecido: 'bg-slate-500',
                          };
                          return (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dot[c.estado] ?? 'bg-slate-500'}`} />
                              <span>
                                <span className="font-medium">{c.dimensao}:</span>{' '}
                                <span className="text-muted-foreground">{c.explicacao}</span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {elegibilidade.resumo && (
                        <p className="text-xs text-muted-foreground pt-1 border-t border-border">{elegibilidade.resumo}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {razoes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Pontos Fortes:
                          </p>
                          <ul className="space-y-1 ml-6">
                            {razoes.map((razao: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground">• {razao}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {alertas.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="space-y-1">
                              {alertas.map((alerta: string, index: number) => (
                                <li key={index} className="text-sm">{alerta}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          onClick={() => gerarAnaliseDetalhada(aviso.id)}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Análise Detalhada IA
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700">
                        <DialogHeader>
                          <DialogTitle>Análise Detalhada de Compatibilidade</DialogTitle>
                          <DialogDescription>
                            Análise gerada por IA para {aviso.nome}
                          </DialogDescription>
                        </DialogHeader>

                        {loadingAnalise === aviso.id ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : analisesPorAviso[aviso.id] && (() => {
                          const analiseDetalhada = analisesPorAviso[aviso.id];
                          // Parse JSON response
                          let analiseIA: any = null;
                          try {
                            const rawText = analiseDetalhada.recomendacoesIA || '';
                            // Clean potential markdown code blocks
                            const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                            analiseIA = JSON.parse(cleanText);
                          } catch (e) {
                            // Fallback to raw text if JSON parsing fails
                            analiseIA = null;
                          }

                          if (!analiseIA) {
                            return (
                              <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-sm bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                  {analiseDetalhada.recomendacoesIA}
                                </div>
                              </div>
                            );
                          }

                          const veredictColors: Record<string, string> = {
                            'APTO': 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
                            'RISCO': 'bg-amber-500/20 border-amber-500 text-amber-400',
                            'EXCLUÍDO': 'bg-red-500/20 border-red-500 text-red-400'
                          };

                          return (
                            <div className="space-y-4">
                              {/* Verdict Header */}
                              <div className={`p-6 rounded-xl border-2 ${veredictColors[analiseIA.veredicto] || veredictColors['RISCO']}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge className={`text-lg px-4 py-1 ${analiseIA.veredicto === 'APTO' ? 'bg-emerald-500' :
                                      analiseIA.veredicto === 'RISCO' ? 'bg-amber-500' : 'bg-red-500'
                                      }`}>
                                      {analiseIA.veredicto}
                                    </Badge>
                                    <span className="text-4xl font-bold">{analiseIA.probabilidadeAprovacao}%</span>
                                  </div>
                                  <Progress value={analiseIA.probabilidadeAprovacao} className="w-32 h-3" />
                                </div>
                                <p className="mt-4 text-lg font-medium">{analiseIA.sumarioExecutivo}</p>
                              </div>

                              {/* Alert Special */}
                              {analiseIA.alertaEspecial && analiseIA.alertaEspecial !== 'null' && (
                                <Alert className="border-amber-500 bg-amber-500/10">
                                  <AlertCircle className="h-5 w-5 text-amber-500" />
                                  <AlertDescription className="text-amber-200 font-medium">
                                    ⚠️ {analiseIA.alertaEspecial}
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Two Column Layout */}
                              <div className="grid grid-cols-2 gap-4">
                                {/* Pontos Fortes */}
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                                  <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="h-5 w-5" /> Pontos Fortes
                                  </h4>
                                  <ul className="space-y-2">
                                    {(analiseIA.pontosFortes || []).map((ponto: string, i: number) => (
                                      <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-emerald-400 mt-0.5">✓</span>
                                        <span>{ponto}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Riscos Críticos */}
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                  <h4 className="font-bold text-red-400 flex items-center gap-2 mb-3">
                                    <AlertCircle className="h-5 w-5" /> Riscos Críticos
                                  </h4>
                                  <ul className="space-y-2">
                                    {(analiseIA.riscosCriticos || []).map((risco: string, i: number) => (
                                      <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-red-400 mt-0.5">⚠</span>
                                        <span>{risco}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Ação Imediata */}
                              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4">
                                <h4 className="font-bold text-blue-400 mb-2">🎯 Ação Imediata</h4>
                                <p className="text-lg font-medium">{analiseIA.acaoImediata}</p>
                              </div>

                              {/* Documentos Prioritários */}
                              {analiseIA.documentosPrioritarios?.length > 0 && (
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                  <h4 className="font-bold text-slate-300 mb-3">📄 Documentos Prioritários</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {analiseIA.documentosPrioritarios.map((doc: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                                        {doc}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" asChild>
                      <a href={aviso.link} target="_blank" rel="noopener noreferrer">
                        Ver Aviso Original
                      </a>
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => gerarBriefIA(aviso.id)}
                        >
                          Gerar Brief IA
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700">
                        <DialogHeader>
                          <DialogTitle>Brief Interno IA</DialogTitle>
                          <DialogDescription>
                            Resumo acionável para decisão sobre {aviso.nome}
                          </DialogDescription>
                        </DialogHeader>

                        {loadingBrief === aviso.id ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : briefsPorAviso[aviso.id]?.brief ? (
                          <div className="space-y-5 text-sm">
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="font-semibold">{briefsPorAviso[aviso.id].brief.titulo}</h3>
                                <Badge variant="outline">
                                  {briefsPorAviso[aviso.id].fonte === 'anthropic' ? 'Claude' : 'Fallback'}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {briefsPorAviso[aviso.id].brief.sumarioExecutivo}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold">Elegibilidade</h4>
                                <p>
                                  Score: <span className="font-medium">{briefsPorAviso[aviso.id].brief.elegibilidade.score}%</span>
                                </p>
                                <p>
                                  Prioridade:{' '}
                                  <span className="font-medium">
                                    {briefsPorAviso[aviso.id].brief.elegibilidade.prioridade}
                                  </span>
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-semibold">Recomendação</h4>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                  {briefsPorAviso[aviso.id].brief.recomendacao}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold">Documentos necessários</h4>
                              <ul className="space-y-1">
                                {briefsPorAviso[aviso.id].brief.documentosNecessarios.map((item: string, index: number) => (
                                  <li key={index}>• {item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold">Timeline</h4>
                              <ul className="space-y-1">
                                {briefsPorAviso[aviso.id].brief.timeline.map((item: string, index: number) => (
                                  <li key={index}>• {item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold">Riscos</h4>
                              <ul className="space-y-1">
                                {briefsPorAviso[aviso.id].brief.riscos.map((item: string, index: number) => (
                                  <li key={index}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Ainda sem brief disponível para este aviso.
                          </p>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
