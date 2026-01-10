'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Sparkles, Building2, MapPin, Users, Target, Mail, Search, AlertCircle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Step data
const SETORES = [
    { id: 'tecnologia', label: 'Tecnologia & Software', icon: '💻' },
    { id: 'industria', label: 'Indústria & Fabrico', icon: '🏭' },
    { id: 'turismo', label: 'Turismo & Hotelaria', icon: '🏨' },
    { id: 'agricultura', label: 'Agricultura & Floresta', icon: '🌾' },
    { id: 'comercio', label: 'Comércio', icon: '🛒' },
    { id: 'servicos', label: 'Serviços Empresariais', icon: '💼' },
    { id: 'construcao', label: 'Construção', icon: '🏗️' },
    { id: 'saude', label: 'Saúde', icon: '🏥' },
    { id: 'outro', label: 'Outro', icon: '📦' },
];

const REGIOES = [
    { id: 'norte', label: 'Norte', desc: 'Porto, Braga, Viana' },
    { id: 'centro', label: 'Centro', desc: 'Coimbra, Aveiro, Leiria' },
    { id: 'lisboa', label: 'Lisboa', desc: 'Lisboa, Setúbal' },
    { id: 'alentejo', label: 'Alentejo', desc: 'Évora, Beja, Portalegre' },
    { id: 'algarve', label: 'Algarve', desc: 'Faro' },
    { id: 'acores', label: 'Açores', desc: 'Região Autónoma' },
    { id: 'madeira', label: 'Madeira', desc: 'Região Autónoma' },
];

const DIMENSOES = [
    { id: 'MICRO', label: 'Micro', desc: '< 10 trabalhadores' },
    { id: 'PEQUENA', label: 'Pequena', desc: '10-49 trabalhadores' },
    { id: 'MEDIA', label: 'Média', desc: '50-249 trabalhadores' },
    { id: 'GRANDE', label: 'Grande', desc: '250+ trabalhadores' },
];

const OBJETIVOS = [
    { id: 'inovacao', label: 'Inovação & I&D', icon: '🔬' },
    { id: 'digitalizacao', label: 'Digitalização', icon: '📱' },
    { id: 'internacionalizacao', label: 'Internacionalização', icon: '🌍' },
    { id: 'sustentabilidade', label: 'Sustentabilidade', icon: '🌱' },
    { id: 'formacao', label: 'Formação & RH', icon: '👥' },
    { id: 'investimento', label: 'Investimento Produtivo', icon: '📈' },
];

interface FormData {
    setor: string;
    regiao: string;
    dimensao: string;
    objetivo: string;
    email: string;
    nomeEmpresa: string;
    nif: string;
}

interface EnrichedData {
    nome?: string;
    cae?: string;
    atividade?: string;
    distrito?: string;
    dimensao?: string;
    nutII?: string;
    fontes?: string[];
    confianca?: 'ALTA' | 'MEDIA' | 'BAIXA';
}

interface MatchResult {
    id: string;
    nome: string;
    portal: string;
    link?: string;
    taxa?: string;
    diasRestantes: number;
    readinessScore: number;
    confidence: string;
    reasons: string[];
    missing: string[];
}

export default function QuickMatchPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        setor: '',
        regiao: '',
        dimensao: '',
        objetivo: '',
        email: '',
        nomeEmpresa: '',
        nif: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLookingUpNif, setIsLookingUpNif] = useState(false);
    const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null);
    const [isEditingEnriched, setIsEditingEnriched] = useState(false);
    const [nifError, setNifError] = useState<string | null>(null);
    const [results, setResults] = useState<MatchResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // NIF lookup function
    const lookupNif = useCallback(async (nif: string) => {
        if (nif.length < 9) {
            setEnrichedData(null);
            setNifError(null);
            return;
        }

        const cleanNif = nif.replace(/\s/g, '');
        if (!/^\d{9}$/.test(cleanNif)) {
            setNifError('NIF deve ter 9 dígitos');
            setEnrichedData(null);
            return;
        }

        setIsLookingUpNif(true);
        setNifError(null);

        try {
            const response = await fetch('/api/company-intel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nif: cleanNif }),
            });

            const data = await response.json();

            if (data.success && data.company) {
                setEnrichedData(data.company);
                // Auto-fill nome da empresa se vazio
                if (!formData.nomeEmpresa && data.company.nome) {
                    setFormData(prev => ({ ...prev, nomeEmpresa: data.company.nome }));
                }
            } else {
                setNifError(data.error || 'Não foi possível obter dados');
                setEnrichedData(null);
            }
        } catch {
            setNifError('Erro de ligação');
            setEnrichedData(null);
        } finally {
            setIsLookingUpNif(false);
        }
    }, [formData.nomeEmpresa]);

    const totalSteps = 5;

    const canProceed = () => {
        switch (step) {
            case 1: return !!formData.setor;
            case 2: return !!formData.regiao;
            case 3: return !!formData.dimensao;
            case 4: return !!formData.objetivo;
            case 5: return true; // Email is optional
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/quick-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar');
            }

            setResults(data.matches);
            setStep(6); // Results step
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectOption = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-4">
                        <Sparkles className="w-4 h-4" />
                        Quick Match
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Descubra os Fundos para a Sua Empresa
                    </h1>
                    <p className="text-slate-400">
                        Responda a 5 perguntas rápidas e encontre financiamento em segundos
                    </p>
                </div>

                {/* Progress bar */}
                {step <= totalSteps && (
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                            <span>Passo {step} de {totalSteps}</span>
                            <span>{Math.round((step / totalSteps) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                )}

                {/* Steps */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Step 1: Setor */}
                        {step === 1 && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                        Qual é o setor da sua empresa?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {SETORES.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => selectOption('setor', s.id)}
                                                className={`p-4 rounded-lg border text-left transition-all ${formData.setor === s.id
                                                    ? 'bg-blue-500/20 border-blue-500 text-white'
                                                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2 block">{s.icon}</span>
                                                <span className="text-sm font-medium">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Região */}
                        {step === 2 && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                        Onde está localizada?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        {REGIOES.map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => selectOption('regiao', r.id)}
                                                className={`p-4 rounded-lg border text-left transition-all ${formData.regiao === r.id
                                                    ? 'bg-blue-500/20 border-blue-500 text-white'
                                                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                                    }`}
                                            >
                                                <span className="font-medium">{r.label}</span>
                                                <span className="text-xs text-slate-400 block mt-1">{r.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Dimensão */}
                        {step === 3 && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-400" />
                                        Qual é a dimensão da empresa?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        {DIMENSOES.map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => selectOption('dimensao', d.id)}
                                                className={`p-4 rounded-lg border text-left transition-all ${formData.dimensao === d.id
                                                    ? 'bg-blue-500/20 border-blue-500 text-white'
                                                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                                    }`}
                                            >
                                                <span className="font-medium">{d.label}</span>
                                                <span className="text-xs text-slate-400 block mt-1">{d.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Objetivo */}
                        {step === 4 && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-400" />
                                        Qual é o objetivo do projeto?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        {OBJETIVOS.map(o => (
                                            <button
                                                key={o.id}
                                                onClick={() => selectOption('objetivo', o.id)}
                                                className={`p-4 rounded-lg border text-left transition-all ${formData.objetivo === o.id
                                                    ? 'bg-blue-500/20 border-blue-500 text-white'
                                                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2 block">{o.icon}</span>
                                                <span className="text-sm font-medium">{o.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 5: Contact & NIF (Optional but Recommended) */}
                        {step === 5 && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                        Quase lá! (Opcional)
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Com o NIF obtemos dados reais para resultados mais precisos
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* NIF Field - Highlighted */}
                                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                                        <Label className="text-blue-300 font-medium flex items-center gap-2">
                                            <Search className="w-4 h-4" />
                                            NIF da Empresa
                                            <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded">Recomendado</span>
                                        </Label>
                                        <div className="relative mt-2">
                                            <Input
                                                type="text"
                                                placeholder="500123456"
                                                value={formData.nif}
                                                onChange={e => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                                    setFormData(prev => ({ ...prev, nif: value }));
                                                    if (value.length === 9) {
                                                        lookupNif(value);
                                                    }
                                                }}
                                                className="bg-slate-700 border-slate-600 text-white pr-10"
                                                maxLength={9}
                                            />
                                            {isLookingUpNif && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-400" />
                                            )}
                                            {enrichedData && !isLookingUpNif && (
                                                <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                                            )}
                                        </div>

                                        {/* NIF Error */}
                                        {nifError && (
                                            <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                {nifError}
                                            </div>
                                        )}

                                        {/* Enriched Data Preview */}
                                        {enrichedData && (
                                            <div className="mt-3 p-3 bg-slate-800/80 rounded-lg border border-green-500/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Dados encontrados
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditingEnriched(!isEditingEnriched)}
                                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                                    >
                                                        {isEditingEnriched ? 'Concluído' : 'Editar dados'}
                                                    </button>
                                                </div>

                                                {!isEditingEnriched ? (
                                                    /* Read-only view */
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-slate-500">Nome:</span>
                                                            <span className="text-white ml-1">{enrichedData.nome}</span>
                                                        </div>
                                                        {enrichedData.cae && (
                                                            <div>
                                                                <span className="text-slate-500">CAE:</span>
                                                                <span className="text-white ml-1">{enrichedData.cae}</span>
                                                            </div>
                                                        )}
                                                        {enrichedData.distrito && (
                                                            <div>
                                                                <span className="text-slate-500">Distrito:</span>
                                                                <span className="text-white ml-1">{enrichedData.distrito}</span>
                                                            </div>
                                                        )}
                                                        {enrichedData.dimensao && (
                                                            <div>
                                                                <span className="text-slate-500">Dimensão:</span>
                                                                <span className="text-white ml-1">{enrichedData.dimensao}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    /* Edit mode */
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <label className="text-slate-500 text-xs block mb-1">CAE</label>
                                                            <Input
                                                                type="text"
                                                                value={enrichedData.cae || ''}
                                                                onChange={(e) => setEnrichedData(prev => prev ? { ...prev, cae: e.target.value } : null)}
                                                                className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                                                                placeholder="12345"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-slate-500 text-xs block mb-1">Distrito</label>
                                                            <Input
                                                                type="text"
                                                                value={enrichedData.distrito || ''}
                                                                onChange={(e) => setEnrichedData(prev => prev ? { ...prev, distrito: e.target.value } : null)}
                                                                className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                                                                placeholder="Lisboa"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-slate-500 text-xs block mb-1">Dimensão</label>
                                                            <select
                                                                value={enrichedData.dimensao || ''}
                                                                onChange={(e) => setEnrichedData(prev => prev ? { ...prev, dimensao: e.target.value } : null)}
                                                                className="w-full bg-slate-700 border-slate-600 text-white h-8 text-sm rounded-md px-2"
                                                            >
                                                                <option value="">Selecionar</option>
                                                                <option value="Micro">Micro</option>
                                                                <option value="Pequena">Pequena</option>
                                                                <option value="Média">Média</option>
                                                                <option value="Grande">Grande</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-slate-500 text-xs block mb-1">Atividade</label>
                                                            <Input
                                                                type="text"
                                                                value={enrichedData.atividade || ''}
                                                                onChange={(e) => setEnrichedData(prev => prev ? { ...prev, atividade: e.target.value } : null)}
                                                                className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                                                                placeholder="Consultoria"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {enrichedData.confianca && !isEditingEnriched && (
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Fontes: {enrichedData.fontes?.join(', ') || 'NIF.PT'} •
                                                        Confiança: <span className={enrichedData.confianca === 'ALTA' ? 'text-green-400' : enrichedData.confianca === 'MEDIA' ? 'text-amber-400' : 'text-red-400'}>{enrichedData.confianca}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300">Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={formData.email}
                                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300">Nome da Empresa</Label>
                                            <Input
                                                type="text"
                                                placeholder="Empresa, Lda"
                                                value={formData.nomeEmpresa}
                                                onChange={e => setFormData(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 6: Results */}
                        {step === 6 && results && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        {results.length > 0 ? `Encontrámos ${results.length} fundos para si!` : 'Nenhum fundo encontrado'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {results.length > 0 ? (
                                        <div className="space-y-4">
                                            {results.map((match, idx) => (
                                                <div
                                                    key={match.id}
                                                    className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="text-xs text-blue-400 font-medium">{match.portal}</span>
                                                            <h3 className="text-white font-medium">{match.nome}</h3>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-green-400">{match.readinessScore}%</div>
                                                            <div className="text-xs text-slate-400">Readiness</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap mb-2">
                                                        {match.reasons.slice(0, 3).map((reason, i) => (
                                                            <span key={i} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                                                ✓ {reason}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-400">
                                                            {match.diasRestantes > 0 ? `${match.diasRestantes} dias restantes` : 'Encerrado'}
                                                        </span>
                                                        {match.link && (
                                                            <a href={match.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                                Ver detalhes →
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400">
                                            Não encontrámos fundos abertos para o seu perfil neste momento.
                                            Registe-se para receber alertas quando surgirem novas oportunidades.
                                        </p>
                                    )}

                                    <div className="mt-6 flex gap-3">
                                        <Link href="/auth/register" className="flex-1">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                Criar Conta Gratuita
                                            </Button>
                                        </Link>
                                        <Button variant="outline" onClick={() => { setStep(1); setResults(null); }}>
                                            Recomeçar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {/* Navigation */}
                {step <= totalSteps && (
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={step === 1}
                            className="text-slate-400"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed() || isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A processar...</>
                            ) : step === totalSteps ? (
                                <><Sparkles className="w-4 h-4 mr-2" /> Ver Resultados</>
                            ) : (
                                <>Continuar <ArrowRight className="w-4 h-4 ml-2" /></>
                            )}
                        </Button>
                    </div>
                )}

                {/* Footer link */}
                <div className="text-center mt-8">
                    <Link href="/" className="text-slate-500 hover:text-slate-400 text-sm">
                        ← Voltar ao início
                    </Link>
                </div>
            </div>
        </div>
    );
}
