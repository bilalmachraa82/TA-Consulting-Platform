
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle, 
  FileText, 
  Shield, 
  Calculator, 
  UserCheck,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistViewerProps {
  candidaturaId: string;
}

export function ChecklistViewer({ candidaturaId }: ChecklistViewerProps) {
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    fetchChecklist();
  }, [candidaturaId]);

  const fetchChecklist = async () => {
    try {
      const response = await fetch(`/api/checklists?candidaturaId=${candidaturaId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChecklist(data.checklist);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChecklist = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/checklists/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidaturaId }),
      });

      const data = await response.json();
      if (data.success || data.message) {
        toast.success('Checklist gerada com sucesso!');
        setChecklist(data.checklist);
      } else {
        toast.error(data.error || 'Erro ao gerar checklist');
      }
    } catch (error) {
      console.error('Erro ao gerar checklist:', error);
      toast.error('Erro ao gerar checklist');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateItem = async (itemId: string, status: string) => {
    try {
      const response = await fetch(`/api/checklists/${checklist.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId, 
          status, 
          observacoes: editingItem === itemId ? observacoes : undefined 
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item atualizado!');
        fetchChecklist();
        setEditingItem(null);
        setObservacoes('');
      } else {
        toast.error(data.error || 'Erro ao atualizar item');
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETO':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'EM_PROGRESSO':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'NAO_APLICAVEL':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETO':
        return <Badge className="bg-green-500">Completo</Badge>;
      case 'EM_PROGRESSO':
        return <Badge className="bg-yellow-500">Em Progresso</Badge>;
      case 'NAO_APLICAVEL':
        return <Badge variant="secondary">N/A</Badge>;
      case 'BLOQUEADO':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'DOCUMENTO':
        return <FileText className="w-4 h-4" />;
      case 'VALIDACAO':
        return <Shield className="w-4 h-4" />;
      case 'CALCULO':
        return <Calculator className="w-4 h-4" />;
      case 'APROVACAO':
        return <UserCheck className="w-4 h-4" />;
      case 'COMPLIANCE':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  // Agrupar itens por categoria
  const itemsPorCategoria = checklist?.itens.reduce((acc: any, item: any) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!checklist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Candidatura</CardTitle>
          <CardDescription>
            Gere uma checklist automática baseada nos requisitos do aviso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateChecklist} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Gerar Checklist Automática
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{checklist.nome}</CardTitle>
            <CardDescription>{checklist.descricao}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {checklist.progresso.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Progresso</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra de progresso */}
        <div>
          <Progress value={checklist.progresso} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>
              {checklist.itens.filter((i: any) => i.status === 'COMPLETO' || i.status === 'NAO_APLICAVEL').length} de {checklist.itens.length} itens
            </span>
            {checklist.completa && (
              <span className="text-green-600 font-semibold">✓ Checklist Completa</span>
            )}
          </div>
        </div>

        {/* Itens por categoria */}
        {Object.entries(itemsPorCategoria).map(([categoria, itens]: [string, any]) => (
          <div key={categoria} className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">{categoria}</h3>
            <div className="space-y-2">
              {itens.map((item: any) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTipoIcon(item.tipo)}
                          <span className="font-medium">{item.titulo}</span>
                          {item.obrigatorio && (
                            <span className="text-red-500 text-xs">*</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.descricao}
                        </p>
                        {item.observacoes && (
                          <p className="text-xs text-blue-600 mt-1">
                            💬 {item.observacoes}
                          </p>
                        )}
                      </div>
                      <div>{getStatusBadge(item.status)}</div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getTipoIcon(item.tipo)}
                        {item.titulo}
                        {item.obrigatorio && (
                          <Badge variant="destructive" className="ml-2">Obrigatório</Badge>
                        )}
                      </DialogTitle>
                      <DialogDescription>{item.descricao}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <Select
                          value={item.status}
                          onValueChange={(value) => handleUpdateItem(item.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                            <SelectItem value="EM_PROGRESSO">Em Progresso</SelectItem>
                            <SelectItem value="COMPLETO">Completo</SelectItem>
                            <SelectItem value="NAO_APLICAVEL">Não Aplicável</SelectItem>
                            <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Observações</label>
                        <Textarea
                          placeholder="Adicionar observações..."
                          value={editingItem === item.id ? observacoes : item.observacoes || ''}
                          onChange={(e) => {
                            setEditingItem(item.id);
                            setObservacoes(e.target.value);
                          }}
                          rows={3}
                        />
                        {editingItem === item.id && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => handleUpdateItem(item.id, item.status)}
                          >
                            Salvar Observações
                          </Button>
                        )}
                      </div>
                      {item.completadoEm && (
                        <div className="text-sm text-muted-foreground">
                          Completado em {new Date(item.completadoEm).toLocaleDateString('pt-PT')}
                          {item.completadoPor && ` por ${item.completadoPor}`}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
