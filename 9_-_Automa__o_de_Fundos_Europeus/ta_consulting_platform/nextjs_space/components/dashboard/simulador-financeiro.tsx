'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { calculateNPV, calculateIRR, calculatePaybackPeriod, calculateROI } from '@/lib/financial/core'
import { calculateFinancialAutonomy, calculateEBITDA, calculateGeneralLiquidity, calculateDebtRatio, FinancialData } from '@/lib/financial/ratios'
import { validateFinancialEligibility } from '@/lib/financial/validators'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Activity, PieChart, Loader2 } from 'lucide-react'
import { generateFinancialAnalysis, FinancialAnalysisResult } from '@/app/actions/financial-analysis'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// Define a type for the project data, including cash flows
interface ProjectData {
    investment: number;
    discountRate: number; // %
    cashFlowYear1: number;
    cashFlowYear2: number;
    cashFlowYear3: number;
    cashFlowYear4: number;
    cashFlowYear5: number;
}

interface CalculationResults {
    autonomy: number;
    ebitda: number;
    liquidez: number;
    npv: number;
    irr: number;
    payback: number;
    roi: number;
    debtRatio: number;
    eligibility: {
        isEligible: boolean;
        reasons: string[];
    };
}

export function SimuladorFinanceiro() {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<FinancialAnalysisResult | null>(null);
    const [results, setResults] = useState<CalculationResults | null>(null);

    // State para Dados da Empresa
    const [financialData, setFinancialData] = useState<FinancialData>({
        ativoTotal: 500000,
        passivoTotal: 300000,
        capitalProprio: 200000,
        ativoCorrente: 150000,
        passivoCorrente: 100000,
        vendas: 1000000,
        custosVendas: 600000,
        fornecimentosServicosExternos: 200000,
        gastosPessoal: 150000,
        resultadosLiquidos: 30000,
        jurosGastos: 10000,
        impostos: 10000,
        amortizacoes: 20000
    });

    // State para Projeto
    const [projectData, setProjectData] = useState<ProjectData>({
        investment: 150000,
        discountRate: 5, // %
        cashFlowYear1: 40000,
        cashFlowYear2: 50000,
        cashFlowYear3: 60000,
        cashFlowYear4: 70000,
        cashFlowYear5: 80000
    });

    // Cálculos em Tempo Real (Memoized idealmente, mas simples aqui)
    const autonomia = calculateFinancialAutonomy(financialData);
    const ebitda = calculateEBITDA(financialData);
    const liquidez = calculateGeneralLiquidity(financialData);

    const cashFlows = [
        -projectData.investment,
        projectData.cashFlowYear1,
        projectData.cashFlowYear2,
        projectData.cashFlowYear3,
        projectData.cashFlowYear4,
        projectData.cashFlowYear5
    ];

    const val = calculateNPV(projectData.discountRate / 100, cashFlows);
    const payback = calculatePaybackPeriod(cashFlows);
    let tir = 0;
    try {
        tir = calculateIRR(cashFlows);
    } catch (e) {
        tir = 0;
    }

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const result = await generateFinancialAnalysis({
                financialData,
                investmentData: {
                    totalInvestment: projectData.investment,
                    cashFlows,
                    discountRate: projectData.discountRate / 100
                }
            });
            setAnalysis(result);
            toast.success('Análise financeira gerada com sucesso!');
        } catch (error) {
            toast.error('Erro ao gerar análise. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof FinancialData, value: string) => {
        setFinancialData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleProjectChange = (field: keyof typeof projectData, value: string) => {
        setProjectData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna da Esquerda: Inputs */}
            <div className="space-y-6">
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="dark:text-gray-100">Dados da Empresa (Ano Pré-Projeto)</CardTitle>
                        <CardDescription className="dark:text-gray-400">Insira os dados do último IES aprovado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ativo Total (€)</Label>
                                <Input type="number" value={financialData.ativoTotal} onChange={e => handleInputChange('ativoTotal', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Passivo Total (€)</Label>
                                <Input type="number" value={financialData.passivoTotal} onChange={e => handleInputChange('passivoTotal', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Capital Próprio (€)</Label>
                                <Input type="number" value={financialData.capitalProprio} onChange={e => handleInputChange('capitalProprio', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Resultados Líquidos (€)</Label>
                                <Input type="number" value={financialData.resultadosLiquidos} onChange={e => handleInputChange('resultadosLiquidos', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Vendas / VN (€)</Label>
                                <Input type="number" value={financialData.vendas} onChange={e => handleInputChange('vendas', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Amortizações (€)</Label>
                                <Input type="number" value={financialData.amortizacoes} onChange={e => handleInputChange('amortizacoes', e.target.value)} />
                            </div>
                        </div>

                        <div className="bg-muted/50 dark:bg-slate-900/50 p-4 rounded-lg mt-4 grid grid-cols-3 gap-4 text-center border dark:border-slate-600">
                            <div>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">Autonomia Fin.</p>
                                <p className={`text-lg font-bold ${autonomia < 0.15 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {(autonomia * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">EBITDA</p>
                                <p className="text-lg font-bold dark:text-gray-100">{ebitda.toLocaleString('pt-PT', { notation: 'compact' })}€</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">Liquidez Geral</p>
                                <p className="text-lg font-bold dark:text-gray-100">{liquidez.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="dark:text-gray-100">Projeto de Investimento</CardTitle>
                        <CardDescription className="dark:text-gray-400">Projeção de fluxos de caixa para 5 anos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Investimento Total Elegível (€)</Label>
                                <Input type="number" value={projectData.investment} onChange={e => handleProjectChange('investment', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Taxa de Atualização (%)</Label>
                                <Input type="number" value={projectData.discountRate} onChange={e => handleProjectChange('discountRate', e.target.value)} />
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5].map(year => (
                                <div key={year} className="space-y-1">
                                    <Label className="text-xs">Cash Flow Ano {year}</Label>
                                    <Input
                                        type="number"
                                        value={projectData[`cashFlowYear${year}` as keyof typeof projectData]}
                                        onChange={e => handleProjectChange(`cashFlowYear${year}` as keyof typeof projectData, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="bg-muted/50 dark:bg-slate-900/50 p-4 rounded-lg mt-4 grid grid-cols-3 gap-4 text-center border dark:border-slate-600">
                            <div>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">VAL (NPV)</p>
                                <p className={`text-lg font-bold ${val > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {val.toLocaleString('pt-PT', { notation: 'compact', style: 'currency', currency: 'EUR' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">TIR (IRR)</p>
                                <p className={`text-lg font-bold ${tir > 0.08 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {(tir * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">Payback</p>
                                <p className="text-lg font-bold dark:text-gray-100">{payback > 0 ? payback.toFixed(1) + ' anos' : 'N/A'}</p>
                            </div>
                        </div>

                        <Button className="w-full mt-4" onClick={handleAnalyze} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A Analisar com Gemini 3.0...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Gerar Parecer Técnico IA
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Coluna da Direita: Resultados e Análise IA */}
            <div className="space-y-6">
                {analysis ? (
                    <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30 h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    ✨ Parecer Técnico (Gemini 3.0)
                                </CardTitle>
                                <Badge variant={analysis.risco === 'BAIXO' ? 'default' : analysis.risco === 'MÉDIO' ? 'secondary' : 'destructive'}>
                                    Risco: {analysis.risco}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-justify leading-relaxed dark:text-gray-200">{analysis.parecerTecnico}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2 text-green-700">
                                        <CheckCircle2 className="h-4 w-4" /> Pontos Fortes
                                    </h4>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {analysis.pontosFortes.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="h-4 w-4" /> Pontos de Atenção
                                    </h4>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {analysis.pontosFracos.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-background p-4 rounded-lg border">
                                <h4 className="font-semibold mb-2">Recomendações Estratégicas</h4>
                                <ul className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                                    {analysis.recomendacoes.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-12 text-muted-foreground bg-muted/10">
                        <div className="text-center space-y-2">
                            <TrendingUp className="h-12 w-12 mx-auto opacity-20" />
                            <p>Preencha os dados e clique em "Gerar Parecer" para ver a análise da IA.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
