'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Search, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NifInputProps {
    value: string;
    onChange: (nif: string) => void;
    onCompanyData?: (data: CompanyData) => void;
    className?: string;
    disabled?: boolean;
}

export interface CompanyData {
    nif: string;
    nome?: string;
    cae?: string;
    atividade?: string;
    distrito?: string;
    concelho?: string;
    morada?: string;
}

type LookupStatus = 'idle' | 'loading' | 'success' | 'error' | 'manual';

export default function NifInput({ value, onChange, onCompanyData, className, disabled }: NifInputProps) {
    const [status, setStatus] = useState<LookupStatus>('idle');
    const [message, setMessage] = useState<string>('');
    const [companyName, setCompanyName] = useState<string>('');

    const lookupNif = useCallback(async (nif: string) => {
        // Clean and validate
        const cleanNif = nif.replace(/\s/g, '');
        if (cleanNif.length !== 9) {
            setStatus('idle');
            setMessage('');
            return;
        }

        setStatus('loading');
        setMessage('A procurar dados...');

        try {
            const response = await fetch(`/api/leads/validate-nif?nif=${cleanNif}`);
            const data = await response.json();

            if (data.valid && data.nome) {
                setStatus('success');
                setCompanyName(data.nome);
                setMessage(`Encontrado: ${data.nome}`);

                // Notify parent with company data
                if (onCompanyData) {
                    onCompanyData({
                        nif: cleanNif,
                        nome: data.nome,
                        cae: data.cae,
                        atividade: data.atividade,
                        distrito: data.distrito,
                        concelho: data.concelho,
                        morada: data.morada,
                    });
                }
            } else if (data.valid) {
                setStatus('manual');
                setMessage(data.error || 'NIF válido - preencha os dados manualmente');
            } else {
                setStatus('error');
                setMessage(data.error || 'NIF inválido');
            }
        } catch (error) {
            setStatus('manual');
            setMessage('Erro de ligação - preencha manualmente');
        }
    }, [onCompanyData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and format as user types
        const rawValue = e.target.value.replace(/\D/g, '').slice(0, 9);
        onChange(rawValue);

        // Reset status when typing
        if (rawValue.length < 9) {
            setStatus('idle');
            setMessage('');
            setCompanyName('');
        }
    };

    const handleBlur = () => {
        if (value.length === 9) {
            lookupNif(value);
        }
    };

    const handleSearch = () => {
        if (value.length === 9) {
            lookupNif(value);
        }
    };

    const formatNif = (nif: string): string => {
        // Format as XXX XXX XXX
        const clean = nif.replace(/\D/g, '');
        if (clean.length <= 3) return clean;
        if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
        return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    };

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor="nif" className="text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                NIF da Empresa
            </Label>

            <div className="relative">
                <Input
                    id="nif"
                    type="text"
                    inputMode="numeric"
                    placeholder="501 234 567"
                    value={formatNif(value)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={cn(
                        'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 pr-24',
                        status === 'success' && 'border-green-500/50',
                        status === 'error' && 'border-red-500/50'
                    )}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {status === 'loading' && (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    )}
                    {status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                    {status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    {(status === 'idle' || status === 'manual') && value.length === 9 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleSearch}
                            className="h-6 px-2 text-slate-400 hover:text-white"
                        >
                            <Search className="w-3 h-3 mr-1" />
                            Procurar
                        </Button>
                    )}
                </div>
            </div>

            {/* Status message */}
            {message && (
                <p className={cn(
                    'text-xs flex items-center gap-1',
                    status === 'success' && 'text-green-400',
                    status === 'error' && 'text-red-400',
                    status === 'manual' && 'text-amber-400',
                    status === 'loading' && 'text-blue-400'
                )}>
                    {status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                    {status === 'error' && <AlertCircle className="w-3 h-3" />}
                    {message}
                </p>
            )}

            {/* Auto-filled company card */}
            {status === 'success' && companyName && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-300 font-medium">{companyName}</p>
                    <p className="text-xs text-green-400/70">Dados serão preenchidos automaticamente</p>
                </div>
            )}

            <p className="text-xs text-slate-500">
                Introduza o NIF para pré-preencher os dados da empresa
            </p>
        </div>
    );
}
