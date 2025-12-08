
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface FiltrosAvancadosProps {
  onFiltrar: (filtros: any) => void;
  onExportar?: () => void;
  loading?: boolean;
}

interface OpcoesFiltros {
  portais: { valor: string; total: number }[];
  programas: { valor: string; total: number }[];
  entidades: { valor: string; total: number }[];
  areas: { valor: string; total: number }[];
}

export function FiltrosAvancados({ onFiltrar, onExportar, loading }: FiltrosAvancadosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcoesFiltros>({
    portais: [],
    programas: [],
    entidades: [],
    areas: [],
  });

  const [filtros, setFiltros] = useState({
    pesquisa: '',
    portal: '',
    programa: '',
    entidade: '',
    areaAtuacao: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    orcamentoMin: '',
    orcamentoMax: '',
  });

  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();

  useEffect(() => {
    buscarOpcoesFiltros();
  }, []);

  const buscarOpcoesFiltros = async () => {
    try {
      const response = await fetch('/api/avisos/filtrar');
      const data = await response.json();
      if (data.filtros) {
        setOpcoes(data.filtros);
      }
    } catch (error) {
      console.error('Erro ao buscar opções de filtros:', error);
    }
  };

  const aplicarFiltros = () => {
    const filtrosAplicados = {
      ...filtros,
      dataInicio: dataInicio ? format(dataInicio, 'yyyy-MM-dd') : '',
      dataFim: dataFim ? format(dataFim, 'yyyy-MM-dd') : '',
    };
    onFiltrar(filtrosAplicados);
    toast.success('Filtros aplicados com sucesso!');
  };

  const limparFiltros = () => {
    setFiltros({
      pesquisa: '',
      portal: '',
      programa: '',
      entidade: '',
      areaAtuacao: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      orcamentoMin: '',
      orcamentoMax: '',
    });
    setDataInicio(undefined);
    setDataFim(undefined);
    onFiltrar({});
    toast.info('Filtros limpos');
  };

  const filtrosAtivos = Object.values(filtros).filter(v => v !== '').length + (dataInicio ? 1 : 0) + (dataFim ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Barra de Pesquisa e Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por título, código ou descrição..."
            value={filtros.pesquisa}
            onChange={(e) => setFiltros({ ...filtros, pesquisa: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {filtrosAtivos > 0 && (
              <Badge className="ml-2 px-1.5 py-0.5 text-xs">{filtrosAtivos}</Badge>
            )}
          </Button>
          <Button onClick={aplicarFiltros} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
          </Button>
          {onExportar && (
            <Button variant="outline" onClick={onExportar}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          )}
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Filtros Avançados</CardTitle>
                    <CardDescription>Refine a sua pesquisa com múltiplos critérios</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={limparFiltros}>
                    <X className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primeira Linha */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Portal</Label>
                    <Select value={filtros.portal} onValueChange={(v) => setFiltros({ ...filtros, portal: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os portais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {opcoes.portais.map((p) => (
                          <SelectItem key={p.valor} value={p.valor}>
                            {p.valor} ({p.total})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Programa</Label>
                    <Select value={filtros.programa} onValueChange={(v) => setFiltros({ ...filtros, programa: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os programas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {opcoes.programas.map((p) => (
                          <SelectItem key={p.valor} value={p.valor || 'sem-programa'}>
                            {p.valor || 'Sem programa'} ({p.total})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filtros.status} onValueChange={(v) => setFiltros({ ...filtros, status: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Aberto">Aberto</SelectItem>
                        <SelectItem value="Fechado">Fechado</SelectItem>
                        <SelectItem value="Em Breve">Em Breve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda Linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entidade</Label>
                    <Select value={filtros.entidade} onValueChange={(v) => setFiltros({ ...filtros, entidade: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as entidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        {opcoes.entidades.map((e) => (
                          <SelectItem key={e.valor} value={e.valor || 'sem-entidade'}>
                            {e.valor || 'Sem entidade'} ({e.total})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Área de Atuação</Label>
                    <Select value={filtros.areaAtuacao} onValueChange={(v) => setFiltros({ ...filtros, areaAtuacao: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as áreas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        {opcoes.areas.map((a) => (
                          <SelectItem key={a.valor} value={a.valor || 'sem-area'}>
                            {a.valor || 'Sem área'} ({a.total})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Terceira Linha - Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataInicio ? format(dataInicio, 'PPP', { locale: pt }) : 'Selecionar data'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} locale={pt} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataFim ? format(dataFim, 'PPP', { locale: pt }) : 'Selecionar data'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dataFim} onSelect={setDataFim} locale={pt} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Quarta Linha - Orçamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Orçamento Mínimo (€)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filtros.orcamentoMin}
                      onChange={(e) => setFiltros({ ...filtros, orcamentoMin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Orçamento Máximo (€)</Label>
                    <Input
                      type="number"
                      placeholder="10000000"
                      value={filtros.orcamentoMax}
                      onChange={(e) => setFiltros({ ...filtros, orcamentoMax: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags de Filtros Ativos */}
      {filtrosAtivos > 0 && (
        <div className="flex flex-wrap gap-2">
          {filtros.portal && (
            <Badge variant="secondary">
              Portal: {filtros.portal}
              <X
                className="ml-1 w-3 h-3 cursor-pointer"
                onClick={() => setFiltros({ ...filtros, portal: '' })}
              />
            </Badge>
          )}
          {filtros.programa && (
            <Badge variant="secondary">
              Programa: {filtros.programa}
              <X
                className="ml-1 w-3 h-3 cursor-pointer"
                onClick={() => setFiltros({ ...filtros, programa: '' })}
              />
            </Badge>
          )}
          {filtros.status && (
            <Badge variant="secondary">
              Status: {filtros.status}
              <X
                className="ml-1 w-3 h-3 cursor-pointer"
                onClick={() => setFiltros({ ...filtros, status: '' })}
              />
            </Badge>
          )}
          {dataInicio && (
            <Badge variant="secondary">
              De: {format(dataInicio, 'dd/MM/yyyy')}
              <X className="ml-1 w-3 h-3 cursor-pointer" onClick={() => setDataInicio(undefined)} />
            </Badge>
          )}
          {dataFim && (
            <Badge variant="secondary">
              Até: {format(dataFim, 'dd/MM/yyyy')}
              <X className="ml-1 w-3 h-3 cursor-pointer" onClick={() => setDataFim(undefined)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
