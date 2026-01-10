'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import NifInput, { CompanyData } from './nif-input';

// ============ Types ============

interface FormData {
    // Step 1
    nif: string;
    nomeEmpresa: string;
    email: string;
    distrito: string;
    tipoProjetoDesejado: string;
    // Step 2
    cae: string;
    dimensao: string;
    investimentoEstimado: string;
    empregados: string;
    // Consent
    consentMarketing: boolean;
    consentPartilha: boolean;
}

interface WizardProps {
    onComplete: (leadId: string, matches: MatchResult[]) => void;
}

interface MatchResult {
    avisoId: string;
    avisoNome: string;
    portal: string;
    link?: string;
    taxa?: string;
    diasRestantes: number;
    score: number;
    confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
    reasons: string[];
    missing: string[];
}

// ============ Constants ============

const DISTRITOS = [
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra',
    'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto',
    'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu',
    'Açores', 'Madeira'
];

const TIPOS_PROJETO = [
    { value: 'inovacao', label: 'Inovação Produtiva' },
    { value: 'digital', label: 'Transição Digital' },
    { value: 'internacional', label: 'Internacionalização' },
    { value: 'sustentabilidade', label: 'Sustentabilidade / Energia' },
    { value: 'producao', label: 'Aumento de Capacidade Produtiva' },
    { value: 'outro', label: 'Outro' },
];

const DIMENSOES = [
    { value: 'MICRO', label: 'Micro (< 10 empregados)' },
    { value: 'PEQUENA', label: 'Pequena (10-49 empregados)' },
    { value: 'MEDIA', label: 'Média (50-249 empregados)' },
    { value: 'GRANDE', label: 'Grande (250+ empregados)' },
];

const INVESTIMENTOS = [
    { value: '10000', label: '< €25.000' },
    { value: '50000', label: '€25.000 - €100.000' },
    { value: '200000', label: '€100.000 - €500.000' },
    { value: '750000', label: '€500.000 - €1.000.000' },
    { value: '2000000', label: '> €1.000.000' },
];

// ============ Component ============

export default function WizardForm({ onComplete }: WizardProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        nif: '',
        nomeEmpresa: '',
        email: '',
        distrito: '',
        tipoProjetoDesejado: '',
        cae: '',
        dimensao: '',
        investimentoEstimado: '',
        empregados: '',
        consentMarketing: false,
        consentPartilha: false,
    });

    const [nifEnriched, setNifEnriched] = useState(false);

    const updateField = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleNifData = (data: CompanyData) => {
        setFormData(prev => ({
            ...prev,
            nif: data.nif,
            nomeEmpresa: data.nome || prev.nomeEmpresa,
            cae: data.cae || prev.cae,
            distrito: data.distrito || prev.distrito,
        }));
        setNifEnriched(true);
    };

    const validateStep1 = (): boolean => {
        if (!formData.nomeEmpresa.trim()) {
            setError('Por favor indique o nome da empresa');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Por favor indique um email válido');
            return false;
        }
        if (!formData.distrito) {
            setError('Por favor selecione o distrito');
            return false;
        }
        if (!formData.tipoProjetoDesejado) {
            setError('Por favor indique o tipo de projeto');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/leads/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomeEmpresa: formData.nomeEmpresa,
                    email: formData.email,
                    distrito: formData.distrito,
                    tipoProjetoDesejado: formData.tipoProjetoDesejado,
                    cae: formData.cae || undefined,
                    dimensao: formData.dimensao || undefined,
                    investimentoEstimado: formData.investimentoEstimado ? parseInt(formData.investimentoEstimado) : undefined,
                    empregados: formData.empregados ? parseInt(formData.empregados) : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar');
            }

            // Simulate processing time for UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            onComplete(data.leadId, data.matches);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao submeter');
        } finally {
            setIsLoading(false);
        }
    };

    // ============ Step 1: Basic Info ============

    if (step === 1) {
        return (
            <Card className="w-full max-w-lg mx-auto border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Pré-Diagnóstico de Elegibilidade</CardTitle>
                    <CardDescription className="text-slate-400">
                        Descubra os fundos PT2030 mais relevantes para a sua empresa em 2 minutos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* NIF Input with Auto-lookup */}
                    <NifInput
                        value={formData.nif}
                        onChange={(nif) => updateField('nif', nif)}
                        onCompanyData={handleNifData}
                    />

                    {/* Nome Empresa - may be auto-filled */}
                    <div className="space-y-2">
                        <Label htmlFor="nomeEmpresa" className="text-slate-300 flex items-center gap-2">
                            Nome da Empresa
                            {nifEnriched && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Auto-preenchido</span>}
                        </Label>
                        <Input
                            id="nomeEmpresa"
                            placeholder="Ex: Tecnologia Inovadora, Lda"
                            value={formData.nomeEmpresa}
                            onChange={(e) => updateField('nomeEmpresa', e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="geral@empresa.pt"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">Distrito</Label>
                        <Select value={formData.distrito} onValueChange={(v) => updateField('distrito', v)}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                <SelectValue placeholder="Selecione o distrito" />
                            </SelectTrigger>
                            <SelectContent>
                                {DISTRITOS.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">O que pretende fazer?</Label>
                        <Select value={formData.tipoProjetoDesejado} onValueChange={(v) => updateField('tipoProjetoDesejado', v)}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                <SelectValue placeholder="Tipo de projeto" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPOS_PROJETO.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleNextStep}
                        className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)]"
                    >
                        Continuar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                        Passo 1 de 2 • Os seus dados estão seguros
                    </p>
                </CardContent>
            </Card>
        );
    }

    // ============ Step 2: Qualification ============

    return (
        <Card className="w-full max-w-lg mx-auto border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-white">Qualificação</CardTitle>
                <CardDescription className="text-slate-400">
                    Quanto mais informação, mais preciso o diagnóstico
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cae" className="text-slate-300 flex items-center gap-2">
                        CAE Principal (opcional)
                        {nifEnriched && formData.cae && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Auto-preenchido</span>}
                    </Label>
                    <Input
                        id="cae"
                        placeholder="Ex: 62010"
                        value={formData.cae}
                        onChange={(e) => updateField('cae', e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500">Código de Atividade Económica</p>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Dimensão da Empresa</Label>
                    <Select value={formData.dimensao} onValueChange={(v) => updateField('dimensao', v)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Número de empregados" />
                        </SelectTrigger>
                        <SelectContent>
                            {DIMENSOES.map(d => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Investimento Estimado</Label>
                    <Select value={formData.investimentoEstimado} onValueChange={(v) => updateField('investimentoEstimado', v)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Montante previsto" />
                        </SelectTrigger>
                        <SelectContent>
                            {INVESTIMENTOS.map(i => (
                                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-4 border-t border-slate-700">
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="consentMarketing"
                            checked={formData.consentMarketing}
                            onCheckedChange={(v) => updateField('consentMarketing', !!v)}
                            className="border-slate-600 data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor="consentMarketing" className="text-sm text-slate-400 leading-tight">
                            Aceito receber alertas de novos fundos relevantes para o meu perfil
                        </label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="consentPartilha"
                            checked={formData.consentPartilha}
                            onCheckedChange={(v) => updateField('consentPartilha', !!v)}
                            className="border-slate-600 data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor="consentPartilha" className="text-sm text-slate-400 leading-tight">
                            Aceito ser contactado por um especialista em fundos
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            A analisar avisos...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Ver Resultados
                        </>
                    )}
                </Button>

                <button
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-slate-500 hover:text-slate-300"
                >
                    ← Voltar ao passo anterior
                </button>
            </CardContent>
        </Card>
    );
}
