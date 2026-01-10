'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentCheckboxesProps {
    onConsentChange: (consents: ConsentState) => void;
    consents: ConsentState;
}

export interface ConsentState {
    marketing: boolean;
    partnerContact: boolean;
    dataProcessing: boolean;
}

export default function ConsentCheckboxes({ onConsentChange, consents }: ConsentCheckboxesProps) {
    const handleChange = (field: keyof ConsentState, value: boolean) => {
        onConsentChange({
            ...consents,
            [field]: value,
        });
    };

    return (
        <div className="space-y-4">
            {/* Data Processing - Required */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <Checkbox
                    id="dataProcessing"
                    checked={consents.dataProcessing}
                    onCheckedChange={(checked) => handleChange('dataProcessing', checked === true)}
                    className="mt-0.5"
                />
                <div className="space-y-1">
                    <Label htmlFor="dataProcessing" className="text-sm text-slate-200 font-medium cursor-pointer">
                        Aceito o tratamento dos meus dados <span className="text-red-400">*</span>
                    </Label>
                    <p className="text-xs text-slate-400">
                        Li e aceito a <a href="/privacidade" className="text-blue-400 hover:underline">Política de Privacidade</a>.
                        Os meus dados serão tratados conforme o RGPD para efeitos de diagnóstico de elegibilidade.
                    </p>
                </div>
            </div>

            {/* Marketing Alerts - Optional */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <Checkbox
                    id="marketing"
                    checked={consents.marketing}
                    onCheckedChange={(checked) => handleChange('marketing', checked === true)}
                    className="mt-0.5"
                />
                <div className="space-y-1">
                    <Label htmlFor="marketing" className="text-sm text-slate-200 cursor-pointer">
                        Receber alertas de novos avisos
                    </Label>
                    <p className="text-xs text-slate-400">
                        Quero ser notificado por email quando abrirem avisos compatíveis com o meu perfil.
                    </p>
                </div>
            </div>

            {/* Partner Contact - Optional */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <Checkbox
                    id="partnerContact"
                    checked={consents.partnerContact}
                    onCheckedChange={(checked) => handleChange('partnerContact', checked === true)}
                    className="mt-0.5"
                />
                <div className="space-y-1">
                    <Label htmlFor="partnerContact" className="text-sm text-slate-200 cursor-pointer">
                        Autorizo contacto por consultoras parceiras
                    </Label>
                    <p className="text-xs text-slate-400">
                        Aceito ser contactado por consultoras certificadas da rede TA Consulting para apoio na
                        candidatura. Pode retirar o consentimento a qualquer momento.
                    </p>
                </div>
            </div>

            {/* Legal Notice */}
            <p className="text-xs text-slate-500 text-center">
                <span className="text-red-400">*</span> Campos de preenchimento obrigatório.
                Responsável pelo tratamento: TA Consulting Lda. Pode exercer os seus direitos ARCO
                através de <a href="mailto:rgpd@taconsulting.pt" className="text-blue-400 hover:underline">rgpd@taconsulting.pt</a>.
            </p>
        </div>
    );
}
