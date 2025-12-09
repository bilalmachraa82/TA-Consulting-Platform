
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
  const { data: session, status } = useSession() || {};
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>('');
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analiseDetalhada, setAnaliseDetalhada] = useState<any>(null);
  const [loadingAnalise, setLoadingAnalise] = useState(false);

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
      setEmpresas(data);

      if (data.length > 0) {
        setEmpresaSelecionada(data[0].id);
        carregarRecomendacoes(data[0].id);
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
    carregarRecomendacoes(empresaId);
  };

  const gerarAnaliseDetalhada = async (avisoId: string) => {
    setLoadingAnalise(true);
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
      setAnaliseDetalhada(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao gerar análise detalhada');
    } finally {
      setLoadingAnalise(false);
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {recomendacoes.filter(r => r.prioridade === 'alta').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Compatibilidade &gt; 80%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Média Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {recomendacoes.filter(r => r.prioridade === 'média').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Compatibilidade 60-80%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
            const { aviso, score, razoes, alertas, prioridade } = recomendacao;
            const diasRestantes = Math.ceil((new Date(aviso.dataFimSubmissao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={aviso.id} className="hover:shadow-lg transition-shadow">
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

                  {/* Razões de Compatibilidade */}
                  {razoes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Pontos Fortes:
                      </p>
                      <ul className="space-y-1 ml-6">
                        {razoes.map((razao: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {razao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alertas */}
                  {alertas.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="space-y-1">
                          {alertas.map((alerta: string, index: number) => (
                            <li key={index} className="text-sm">
                              {alerta}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
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
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Análise Detalhada de Compatibilidade</DialogTitle>
                          <DialogDescription>
                            Análise gerada por IA para {aviso.nome}
                          </DialogDescription>
                        </DialogHeader>

                        {loadingAnalise ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : analiseDetalhada && (
                          <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">Score de Compatibilidade</h3>
                                <span className="text-2xl font-bold text-primary">
                                  {analiseDetalhada.analise.score}%
                                </span>
                              </div>
                              <Progress value={analiseDetalhada.analise.score} className="h-2" />
                            </div>

                            {analiseDetalhada.recomendacoesIA && (
                              <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-sm">
                                  {analiseDetalhada.recomendacoesIA}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" asChild>
                      <a href={aviso.link} target="_blank" rel="noopener noreferrer">
                        Ver Aviso Original
                      </a>
                    </Button>

                    <Button variant="outline">
                      Criar Candidatura
                    </Button>
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
