'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, ArrowRight, Target, Clock, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReadinessGauge, EligibilityChecklist } from '@/components/eligibility';
import { PDFExportDialog } from '@/components/pdf/export-dialog';
import type { MatchResult } from '@/lib/eligibility-engine';

interface Empresa {
    id: string;
    nome: string;
    nipc: string;
    cae: string;
    dimensao: string;
    distrito: string;
}

export default function ElegibilidadePage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [selectedEmpresaData, setSelectedEmpresaData] = useState<Empresa | null>(null);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);

    // Fetch empresas on mount
    useEffect(() => {
        async function fetchEmpresas() {
            try {
                const res = await fetch('/api/eligibility/empresas');
                if (!res.ok) throw new Error('Failed to fetch empresas');
                const data = await res.json();
                setEmpresas(data.empresas || []);
            } catch (error) {
                console.error('Error fetching empresas:', error);
                toast.error('Erro ao carregar empresas');
            } finally {
                setLoadingEmpresas(false);
            }
        }
        fetchEmpresas();
    }, []);

    // Run eligibility check when empresa changes
    async function runEligibilityCheck() {
        if (!selectedEmpresa) return;

        setLoading(true);
        try {
            const res = await fetch('/api/eligibility/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ empresaId: selectedEmpresa }),
            });

            if (!res.ok) throw new Error('Failed to check eligibility');

            const data = await res.json();
            setMatches(data.matches || []);
            setSelectedEmpresaData(data.empresa);
            toast.success(`${data.matches?.length || 0} avisos compatíveis encontrados`);
        } catch (error) {
            console.error('Error checking eligibility:', error);
            toast.error('Erro ao verificar elegibilidade');
            setMatches([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (selectedEmpresa) {
            runEligibilityCheck();
        } else {
            setMatches([]);
            setSelectedEmpresaData(null);
        }
    }, [selectedEmpresa]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Análise de Elegibilidade</h1>
                <p className="text-muted-foreground mt-2">
                    Verifique a compatibilidade da sua empresa com os avisos disponíveis
                </p>
            </div>

            {/* Company Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Selecionar Empresa
                    </CardTitle>
                    <CardDescription>
                        Escolha uma empresa para analisar a elegibilidade
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Select
                            value={selectedEmpresa}
                            onValueChange={setSelectedEmpresa}
                            disabled={loadingEmpresas}
                        >
                            <SelectTrigger className="w-full md:w-[400px]">
                                <SelectValue placeholder={loadingEmpresas ? "A carregar..." : "Selecione uma empresa..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {empresas.map(empresa => (
                                    <SelectItem key={empresa.id} value={empresa.id}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{empresa.nome}</span>
                                            <span className="text-muted-foreground text-xs">
                                                CAE {empresa.cae} • {empresa.dimensao}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedEmpresa && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={runEligibilityCheck}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        )}
                    </div>

                    {selectedEmpresaData && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg relative">
                            <div className="absolute top-4 right-4">
                                <PDFExportDialog
                                    entityId={selectedEmpresa}
                                    entityType="empresa"
                                    entityName={selectedEmpresaData.nome}
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pr-12">
                                <div>
                                    <p className="text-muted-foreground">NIPC</p>
                                    <p className="font-medium">{selectedEmpresaData.nipc}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">CAE</p>
                                    <p className="font-medium">{selectedEmpresaData.cae}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Dimensão</p>
                                    <p className="font-medium">{selectedEmpresaData.dimensao}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Região</p>
                                    <p className="font-medium">{selectedEmpresaData.distrito || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">A analisar elegibilidade...</span>
                </div>
            )}

            {/* Results */}
            {!loading && matches.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Avisos Compatíveis ({matches.length})
                    </h2>

                    <div className="grid gap-4">
                        {matches.map(match => (
                            <Card key={match.avisoId} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Gauge Section */}
                                        <div className="p-6 bg-muted/30 flex items-center justify-center md:w-48">
                                            <ReadinessGauge
                                                score={match.score}
                                                confidence={match.confidence}
                                                size="md"
                                            />
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-6 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{match.avisoNome}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                            {match.portal}
                                                        </span>
                                                        {match.taxa && (
                                                            <span>Taxa: {match.taxa}</span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {match.diasRestantes} dias
                                                        </span>
                                                    </div>
                                                </div>
                                                {match.link && (
                                                    <a
                                                        href={match.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-primary"
                                                    >
                                                        <ExternalLink className="h-5 w-5" />
                                                    </a>
                                                )}
                                            </div>

                                            <EligibilityChecklist match={match} />

                                            <div className="flex justify-end">
                                                <Button asChild>
                                                    <a href={`/dashboard/candidaturas/nova?aviso=${match.avisoId}&empresa=${selectedEmpresa}`}>
                                                        Iniciar Candidatura
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && selectedEmpresa && matches.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Nenhum aviso compatível</h3>
                        <p className="text-muted-foreground mt-2">
                            Não foram encontrados avisos compatíveis com o perfil desta empresa.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* No empresas State */}
            {!loadingEmpresas && empresas.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Sem empresas registadas</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                            Adicione uma empresa para começar a análise de elegibilidade.
                        </p>
                        <Button asChild>
                            <a href="/dashboard/empresas">
                                Adicionar Empresa
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
