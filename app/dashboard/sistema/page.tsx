'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Activity,
    Database,
    Server,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Brain,
    Clock,
    HardDrive,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HealthData {
    status: 'healthy' | 'degraded' | 'unhealthy';
    database: {
        connected: boolean;
        avisoCount: number;
        avisosByPortal: Record<string, number>;
        lastAvisoDate?: string;
    };
    rag?: {
        documentCount: number;
        status: string;
    };
    system: {
        uptime: number;
        memoryUsage: number;
        nodeVersion: string;
    };
    timestamp: string;
}

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'healthy':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'degraded':
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        default:
            return <XCircle className="h-5 w-5 text-red-500" />;
    }
};

const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
        healthy: 'bg-green-100 text-green-800 border-green-200',
        degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        unhealthy: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
        <Badge className={`${colors[status as keyof typeof colors] || colors.unhealthy} border`}>
            {status.toUpperCase()}
        </Badge>
    );
};

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function SistemaPage() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/monitoring/health');
            if (!response.ok) throw new Error('Health check failed');
            const data = await response.json();
            setHealth(data);
        } catch (err) {
            setError('Não foi possível obter o estado do sistema');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !health) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-gray-500 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    A verificar estado do sistema...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Estado do Sistema
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Monitorização em tempo real da plataforma
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchHealth}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-5 w-5" />
                            {error}
                        </div>
                    </CardContent>
                </Card>
            )}

            {health && (
                <>
                    {/* Overall Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <StatusIcon status={health.status} />
                                        Estado Global
                                    </CardTitle>
                                    <StatusBadge status={health.status} />
                                </div>
                                <CardDescription>
                                    Última verificação: {formatDate(health.timestamp)}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Database Status */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Database className="h-4 w-4" />
                                        Base de Dados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Conexão</span>
                                            <Badge variant={health.database.connected ? 'default' : 'destructive'}>
                                                {health.database.connected ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Total Avisos</span>
                                            <span className="font-mono font-bold text-lg">
                                                {health.database.avisoCount.toLocaleString('pt-PT')}
                                            </span>
                                        </div>
                                        {health.database.lastAvisoDate && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Última Atualização</span>
                                                <span className="text-xs text-gray-600">
                                                    {formatDate(health.database.lastAvisoDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Portal Distribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Server className="h-4 w-4" />
                                        Avisos por Portal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(health.database.avisosByPortal).map(([portal, count]) => (
                                            <div key={portal} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">{portal}</span>
                                                <span className="font-mono text-sm">{count}</span>
                                            </div>
                                        ))}
                                        {Object.keys(health.database.avisosByPortal).length === 0 && (
                                            <p className="text-sm text-gray-400 italic">Sem dados</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* System Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <HardDrive className="h-4 w-4" />
                                        Sistema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Uptime
                                            </span>
                                            <span className="font-mono text-sm">
                                                {formatUptime(health.system.uptime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Memória</span>
                                            <span className="font-mono text-sm">
                                                {health.system.memoryUsage} MB
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Node.js</span>
                                            <span className="font-mono text-xs text-gray-600">
                                                {health.system.nodeVersion}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* RAG Status */}
                        {health.rag && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Brain className="h-4 w-4" />
                                            Sistema RAG
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Estado</span>
                                                <Badge variant={health.rag.status === 'configured' ? 'default' : 'secondary'}>
                                                    {health.rag.status === 'configured' ? 'Configurado' : health.rag.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Documentos Indexados</span>
                                                <span className="font-mono font-bold">
                                                    {health.rag.documentCount}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
