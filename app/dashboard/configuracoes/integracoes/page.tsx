'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
    MessageSquare,
    Users,
    CheckCircle,
    XCircle,
    ExternalLink,
    RefreshCw,
    Trash2,
    Settings
} from 'lucide-react';

interface Integration {
    id: string;
    type: 'SLACK' | 'TEAMS';
    isActive: boolean;
    metadata: {
        team_name?: string;
        channel?: string;
    };
    createdAt: string;
}

// Slack & Teams brand colors
const INTEGRATION_CONFIG = {
    SLACK: {
        name: 'Slack',
        icon: MessageSquare,
        color: 'bg-[#4A154B]',
        description: 'Recebe notificações e usa comandos /ta no Slack.',
        features: ['Notificações de avisos', 'Comando /ta avisos', 'Comando /ta elegibilidade'],
    },
    TEAMS: {
        name: 'Microsoft Teams',
        icon: Users,
        color: 'bg-[#6264A7]',
        description: 'Conecta o bot TA Consulting aos teus canais Teams.',
        features: ['Adaptive Cards', 'Bot interativo', 'Notificações em canal'],
    },
};

export default function IntegracoesPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIntegrations();

        // Check for success/error params
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'slack') {
            toast.success('Slack conectado com sucesso!');
            window.history.replaceState({}, '', '/dashboard/configuracoes/integracoes');
        }
        if (params.get('error')) {
            toast.error('Erro ao conectar integração. Tenta novamente.');
            window.history.replaceState({}, '', '/dashboard/configuracoes/integracoes');
        }
    }, []);

    const fetchIntegrations = async () => {
        try {
            const res = await fetch('/api/integrations');
            if (res.ok) {
                const data = await res.json();
                setIntegrations(data.integrations || []);
            }
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (type: 'SLACK' | 'TEAMS') => {
        if (type === 'SLACK') {
            window.location.href = '/api/integrations/slack';
        } else {
            // Teams requires Azure bot registration - show instructions
            toast.info('Para conectar Teams, contacta o administrador para configurar o bot no Azure.');
        }
    };

    const handleDisconnect = async (integrationId: string) => {
        try {
            const res = await fetch(`/api/integrations/${integrationId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Integração removida');
                fetchIntegrations();
            }
        } catch (error) {
            toast.error('Erro ao remover integração');
        }
    };

    const handleToggle = async (integrationId: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/integrations/${integrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive }),
            });

            if (res.ok) {
                toast.success(isActive ? 'Integração ativada' : 'Integração pausada');
                fetchIntegrations();
            }
        } catch (error) {
            toast.error('Erro ao atualizar integração');
        }
    };

    const getIntegration = (type: 'SLACK' | 'TEAMS') => {
        return integrations.find(i => i.type === type);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Integrações
                </h1>
                <p className="text-muted-foreground mt-2">
                    Conecta a TA Consulting Platform às tuas ferramentas de trabalho.
                </p>
            </div>

            {/* Integration Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {(['SLACK', 'TEAMS'] as const).map((type) => {
                    const config = INTEGRATION_CONFIG[type];
                    const integration = getIntegration(type);
                    const Icon = config.icon;

                    return (
                        <Card key={type} className="overflow-hidden">
                            {/* Header with brand color */}
                            <div className={`${config.color} p-4 text-white`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-8 w-8" />
                                        <div>
                                            <h3 className="font-bold text-lg">{config.name}</h3>
                                            {integration && (
                                                <span className="text-sm opacity-80">
                                                    {integration.metadata.team_name || 'Conectado'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {integration ? (
                                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Conectado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-white/50 text-white">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Não conectado
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {config.description}
                                </p>

                                {/* Features */}
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Funcionalidades</p>
                                    <ul className="text-sm space-y-1">
                                        {config.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    {integration ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={integration.isActive}
                                                    onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                                                />
                                                <span className="text-sm">
                                                    {integration.isActive ? 'Ativo' : 'Pausado'}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDisconnect(integration.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Desconectar
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => handleConnect(type)}
                                            className={config.color}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Conectar {config.name}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Environment Variables Info */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-sm">Configuração Necessária</CardTitle>
                    <CardDescription>
                        Para ativar as integrações, adiciona as seguintes variáveis ao teu `.env`:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="text-xs bg-black text-green-400 p-4 rounded-lg overflow-x-auto">
                        {`# Slack
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_REDIRECT_URI=https://your-domain.com/api/integrations/slack

# Microsoft Teams
TEAMS_APP_ID=your_app_id
TEAMS_APP_PASSWORD=your_app_password
TEAMS_TENANT_ID=your_tenant_id`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
