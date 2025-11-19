'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash,
  Download,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  Target,
  TrendingUp,
} from 'lucide-react';

interface Memoria {
  id: string;
  titulo: string;
  status: string;
  empresaId: string;
  avisoId: string;
  empresa?: { nome: string; nipc: string };
  aviso?: { nome: string; codigo: string; portal: string };
  modeloUsado?: string;
  tempoGeracao?: number;
  qualityScore?: number;
  seccoes?: Array<{
    id: string;
    titulo: string;
    status: string;
    numeroSeccao: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Empresa {
  id: string;
  nome: string;
  nipc: string;
  setor?: string;
  dimensao?: string;
}

interface Aviso {
  id: string;
  nome: string;
  codigo: string;
  portal: string;
  programa?: string;
}

export function MemoriasDescritivasComponent() {
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedMemoria, setSelectedMemoria] = useState<Memoria | null>(null);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    empresaId: '',
    avisoId: '',
    designacao: '',
    objetivos: [''],
    atividades: [''],
    investimentoTotal: '',
    investimentoElegivel: '',
    prazoExecucao: '12',
    detalhesAdicionais: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [memoriasRes, empresasRes, avisosRes] = await Promise.all([
        fetch('/api/memorias-descritivas'),
        fetch('/api/empresas?limit=100'),
        fetch('/api/avisos?ativo=true&limit=100'),
      ]);

      if (memoriasRes.ok) {
        const data = await memoriasRes.json();
        setMemorias(data.memorias || []);
      }

      if (empresasRes.ok) {
        const data = await empresasRes.json();
        setEmpresas(data.empresas || []);
      }

      if (avisosRes.ok) {
        const data = await avisosRes.json();
        setAvisos(data.avisos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!formData.empresaId || !formData.avisoId || !formData.designacao) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (formData.objetivos.filter(o => o.trim()).length === 0) {
      toast.error('Adicione pelo menos um objetivo');
      return;
    }

    try {
      setGenerating(true);

      const response = await fetch('/api/memorias-descritivas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: formData.empresaId,
          avisoId: formData.avisoId,
          dadosProjeto: {
            designacao: formData.designacao,
            objetivos: formData.objetivos.filter(o => o.trim()),
            atividades: formData.atividades.filter(a => a.trim()),
            investimentoTotal: formData.investimentoTotal,
            investimentoElegivel: formData.investimentoElegivel,
            prazoExecucao: parseInt(formData.prazoExecucao),
            detalhesAdicionais: formData.detalhesAdicionais,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar memória');
      }

      const data = await response.json();

      toast.success('Geração iniciada com sucesso!', {
        description: 'A memória descritiva está a ser gerada. Acompanhe o progresso na lista.',
      });

      setShowNewDialog(false);
      resetForm();
      loadData();

      // Polling para atualizar status
      startPolling();
    } catch (error) {
      console.error('Erro ao gerar memória:', error);
      toast.error('Erro ao gerar memória descritiva');
    } finally {
      setGenerating(false);
    }
  }

  function startPolling() {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/memorias-descritivas');
        if (response.ok) {
          const data = await response.json();
          setMemorias(data.memorias || []);

          // Parar polling se todas as memórias estiverem finalizadas
          const hasGenerating = data.memorias.some((m: Memoria) => m.status === 'EM_GERACAO');
          if (!hasGenerating) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Erro no polling:', error);
      }
    }, 3000);

    // Limpar após 5 minutos
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  }

  function resetForm() {
    setFormData({
      empresaId: '',
      avisoId: '',
      designacao: '',
      objetivos: [''],
      atividades: [''],
      investimentoTotal: '',
      investimentoElegivel: '',
      prazoExecucao: '12',
      detalhesAdicionais: '',
    });
  }

  async function viewMemoria(id: string) {
    try {
      const response = await fetch(`/api/memorias-descritivas/${id}`);
      if (!response.ok) throw new Error('Erro ao carregar memória');

      const data = await response.json();
      setSelectedMemoria(data.memoria);
      setShowViewDialog(true);
    } catch (error) {
      console.error('Erro ao visualizar memória:', error);
      toast.error('Erro ao carregar memória');
    }
  }

  async function deleteMemoria(id: string) {
    if (!confirm('Tem certeza que deseja eliminar esta memória descritiva?')) {
      return;
    }

    try {
      const response = await fetch(`/api/memorias-descritivas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao eliminar');

      toast.success('Memória eliminada com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao eliminar:', error);
      toast.error('Erro ao eliminar memória');
    }
  }

  async function exportMemoria(formato: 'docx' | 'markdown' = 'docx') {
    if (!selectedMemoria) return;

    try {
      toast.loading('A preparar exportação...');

      const response = await fetch(
        `/api/memorias-descritivas/${selectedMemoria.id}/exportar?formato=${formato}`
      );

      if (!response.ok) throw new Error('Erro ao exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memoria_${selectedMemoria.empresa?.nome}_${new Date().toISOString().split('T')[0]}.${formato === 'docx' ? 'docx' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success('Memória exportada com sucesso');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.dismiss();
      toast.error('Erro ao exportar memória');
    }
  }

  function getStatusBadge(status: string) {
    const config: Record<string, { variant: any; icon: any; label: string }> = {
      RASCUNHO: { variant: 'secondary', icon: Edit, label: 'Rascunho' },
      EM_GERACAO: { variant: 'default', icon: Loader2, label: 'A Gerar...' },
      GERADA: { variant: 'default', icon: CheckCircle, label: 'Gerada' },
      EM_REVISAO: { variant: 'outline', icon: Eye, label: 'Em Revisão' },
      APROVADA: { variant: 'default', icon: CheckCircle, label: 'Aprovada' },
      ERRO: { variant: 'destructive', icon: AlertCircle, label: 'Erro' },
    };

    const cfg = config[status] || config.RASCUNHO;
    const Icon = cfg.icon;

    return (
      <Badge variant={cfg.variant as any} className="gap-1">
        <Icon className={`h-3 w-3 ${status === 'EM_GERACAO' ? 'animate-spin' : ''}`} />
        {cfg.label}
      </Badge>
    );
  }

  function addObjectivo() {
    setFormData(prev => ({ ...prev, objetivos: [...prev.objetivos, ''] }));
  }

  function updateObjectivo(index: number, value: string) {
    setFormData(prev => {
      const updated = [...prev.objetivos];
      updated[index] = value;
      return { ...prev, objetivos: updated };
    });
  }

  function removeObjectivo(index: number) {
    setFormData(prev => ({
      ...prev,
      objetivos: prev.objetivos.filter((_, i) => i !== index),
    }));
  }

  function addAtividade() {
    setFormData(prev => ({ ...prev, atividades: [...prev.atividades, ''] }));
  }

  function updateAtividade(index: number, value: string) {
    setFormData(prev => {
      const updated = [...prev.atividades];
      updated[index] = value;
      return { ...prev, atividades: updated };
    });
  }

  function removeAtividade(index: number) {
    setFormData(prev => ({
      ...prev,
      atividades: prev.atividades.filter((_, i) => i !== index),
    }));
  }

  function formatMarkdownToHTML(markdown: string): string {
    if (!markdown) return '';

    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\* (.+)$/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.+)$/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.+)$/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    // Wrap lists
    html = html.replace(/(<li class="ml-4">.*?<\/li>(\s*<br\/>)*)+/gs, '<ul class="list-disc ml-6 space-y-1">$&</ul>');

    return html;
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memórias Descritivas</h1>
          <p className="text-muted-foreground">
            Geração automática com IA - Claude 4.5 Sonnet
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Memória
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memorias.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4" />
              A Gerar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memorias.filter(m => m.status === 'EM_GERACAO').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Geradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memorias.filter(m => m.status === 'GERADA' || m.status === 'APROVADA').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Qualidade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memorias.length > 0
                ? Math.round(
                    memorias
                      .filter(m => m.qualityScore)
                      .reduce((sum, m) => sum + (m.qualityScore || 0), 0) /
                      memorias.filter(m => m.qualityScore).length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Memórias */}
      <Card>
        <CardHeader>
          <CardTitle>Memórias Geradas</CardTitle>
          <CardDescription>
            Histórico de memórias descritivas geradas pela IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memorias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma memória gerada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece criando a sua primeira memória descritiva com IA
              </p>
              <Button onClick={() => setShowNewDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira Memória
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {memorias.map(memoria => (
                <Card key={memoria.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{memoria.titulo}</h3>
                          {getStatusBadge(memoria.status)}
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>
                              {memoria.empresa?.nome} ({memoria.empresa?.nipc})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>
                              {memoria.aviso?.nome} - {memoria.aviso?.portal}
                            </span>
                          </div>
                        </div>

                        {memoria.modeloUsado && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              {memoria.modeloUsado}
                            </span>
                            {memoria.tempoGeracao && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {memoria.tempoGeracao}s
                              </span>
                            )}
                            {memoria.qualityScore && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Qualidade: {Math.round(memoria.qualityScore)}%
                              </span>
                            )}
                            {memoria.seccoes && memoria.seccoes.length > 0 && (
                              <span>{memoria.seccoes.length} secções</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewMemoria(memoria.id)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMemoria(memoria.id)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Nova Memória */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Gerar Nova Memória Descritiva com IA
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do projeto e a IA gerará uma memória descritiva profissional e
              completa usando Claude 4.5 Sonnet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Empresa e Aviso */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select
                  value={formData.empresaId}
                  onValueChange={value => setFormData(prev => ({ ...prev, empresaId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.nome} ({emp.nipc})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aviso">Aviso/Programa *</Label>
                <Select
                  value={formData.avisoId}
                  onValueChange={value => setFormData(prev => ({ ...prev, avisoId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aviso" />
                  </SelectTrigger>
                  <SelectContent>
                    {avisos.map(aviso => (
                      <SelectItem key={aviso.id} value={aviso.id}>
                        {aviso.nome} - {aviso.portal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Designação do Projeto */}
            <div className="space-y-2">
              <Label htmlFor="designacao">Designação do Projeto *</Label>
              <Input
                id="designacao"
                placeholder="Ex: Implementação de Sistema de Produção Inteligente 4.0"
                value={formData.designacao}
                onChange={e => setFormData(prev => ({ ...prev, designacao: e.target.value }))}
              />
            </div>

            {/* Objetivos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Objetivos do Projeto *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addObjectivo}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {formData.objetivos.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Objetivo ${index + 1}`}
                      value={obj}
                      onChange={e => updateObjectivo(index, e.target.value)}
                    />
                    {formData.objetivos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjectivo(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Atividades */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Atividades Principais</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAtividade}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {formData.atividades.map((ativ, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Atividade ${index + 1}`}
                      value={ativ}
                      onChange={e => updateAtividade(index, e.target.value)}
                    />
                    {formData.atividades.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAtividade(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Investimento e Prazo */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="investimentoTotal">Investimento Total (€)</Label>
                <Input
                  id="investimentoTotal"
                  type="number"
                  placeholder="Ex: 150000"
                  value={formData.investimentoTotal}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, investimentoTotal: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investimentoElegivel">Investimento Elegível (€)</Label>
                <Input
                  id="investimentoElegivel"
                  type="number"
                  placeholder="Ex: 120000"
                  value={formData.investimentoElegivel}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, investimentoElegivel: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prazoExecucao">Prazo (meses)</Label>
                <Input
                  id="prazoExecucao"
                  type="number"
                  placeholder="12"
                  value={formData.prazoExecucao}
                  onChange={e => setFormData(prev => ({ ...prev, prazoExecucao: e.target.value }))}
                />
              </div>
            </div>

            {/* Detalhes Adicionais */}
            <div className="space-y-2">
              <Label htmlFor="detalhes">Detalhes Adicionais (opcional)</Label>
              <Textarea
                id="detalhes"
                placeholder="Informações adicionais sobre o projeto, tecnologias específicas, parcerias, etc."
                rows={4}
                value={formData.detalhesAdicionais}
                onChange={e =>
                  setFormData(prev => ({ ...prev, detalhesAdicionais: e.target.value }))
                }
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Geração com IA Claude 4.5 Sonnet</h4>
                  <p className="text-sm text-muted-foreground">
                    A IA irá gerar uma memória descritiva completa e profissional baseada nas
                    melhores práticas de Portugal 2030, IAPMEI e PRR. O processo demora
                    aproximadamente 2-5 minutos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A Gerar...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Visualizar Memória */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMemoria?.titulo}</DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              {selectedMemoria?.empresa?.nome} • {selectedMemoria?.aviso?.nome}
              {selectedMemoria?.qualityScore && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Qualidade: {Math.round(selectedMemoria.qualityScore)}%
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedMemoria && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
                <TabsTrigger value="metadata">Metadados</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                {selectedMemoria.seccoes && selectedMemoria.seccoes.length > 0 ? (
                  <div className="space-y-6">
                    {selectedMemoria.seccoes.map(seccao => (
                      <Card key={seccao.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{seccao.titulo}</CardTitle>
                            {getStatusBadge(seccao.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {(seccao as any).conteudo ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <div 
                                className="text-sm whitespace-pre-wrap leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                  __html: formatMarkdownToHTML((seccao as any).conteudo) 
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">A gerar conteúdo...</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    {selectedMemoria.status === 'EM_GERACAO' ? (
                      <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                        <p>A gerar memória descritiva...</p>
                      </div>
                    ) : (
                      <p>Nenhuma secção disponível</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Geração</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{selectedMemoria.status}</span>
                    </div>
                    {selectedMemoria.modeloUsado && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modelo IA:</span>
                        <span>{selectedMemoria.modeloUsado}</span>
                      </div>
                    )}
                    {selectedMemoria.tempoGeracao && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo de Geração:</span>
                        <span>{selectedMemoria.tempoGeracao} segundos</span>
                      </div>
                    )}
                    {selectedMemoria.qualityScore && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score de Qualidade:</span>
                        <span>{selectedMemoria.qualityScore.toFixed(1)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criada em:</span>
                      <span>{new Date(selectedMemoria.createdAt).toLocaleString('pt-PT')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Atualizada em:</span>
                      <span>{new Date(selectedMemoria.updatedAt).toLocaleString('pt-PT')}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Fechar
            </Button>
            <Button 
              className="gap-2" 
              onClick={() => exportMemoria('docx')}
              disabled={selectedMemoria?.status === 'EM_GERACAO' || selectedMemoria?.status === 'ERRO'}
            >
              <Download className="h-4 w-4" />
              Exportar DOCX
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
