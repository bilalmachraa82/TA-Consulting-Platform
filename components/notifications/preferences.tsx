
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, MessageSquare, Clock, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreference {
    type: string;
    enabled: boolean;
    channels: string[];
    quietFrom: string | null;
    quietTo: string | null;
}

const NOTIFICATION_TYPES = [
    { id: 'AVISO_PRAZO_7D', label: 'Prazos de Avisos (7 dias)', description: 'Quando um aviso expira em breve', icon: Clock },
    { id: 'DOCUMENTO_EXPIRA_30D', label: 'Documentos a Expirar', description: 'Quando documentos precisam de renovação', icon: Bell },
    { id: 'MILESTONE_ATRASADO', label: 'Milestones Atrasados', description: 'Quando um milestone passa do prazo', icon: Bell },
    { id: 'NOVO_MATCH_80', label: 'Novos Matches (≥80%)', description: 'Quando há uma nova oportunidade relevante', icon: Bell },
    { id: 'CANDIDATURA_UPDATE', label: 'Atualizações de Candidatura', description: 'Mudanças de estado nas candidaturas', icon: Bell },
];

const CHANNELS = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'push', label: 'Push Browser', icon: Smartphone },
    { id: 'slack', label: 'Slack', icon: MessageSquare },
];

export function NotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [globalQuietFrom, setGlobalQuietFrom] = useState('22:00');
    const [globalQuietTo, setGlobalQuietTo] = useState('08:00');

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const res = await fetch('/api/notifications/preferences');
            if (res.ok) {
                const data = await res.json();
                setPreferences(data.preferences || getDefaults());
                if (data.quietFrom) setGlobalQuietFrom(data.quietFrom);
                if (data.quietTo) setGlobalQuietTo(data.quietTo);
            } else {
                setPreferences(getDefaults());
            }
        } catch (error) {
            setPreferences(getDefaults());
        } finally {
            setLoading(false);
        }
    };

    const getDefaults = (): NotificationPreference[] =>
        NOTIFICATION_TYPES.map(t => ({
            type: t.id,
            enabled: true,
            channels: ['email'],
            quietFrom: null,
            quietTo: null,
        }));

    const toggleType = (type: string) => {
        setPreferences(prev =>
            prev.map(p => p.type === type ? { ...p, enabled: !p.enabled } : p)
        );
    };

    const toggleChannel = (type: string, channel: string) => {
        setPreferences(prev =>
            prev.map(p => {
                if (p.type !== type) return p;
                const channels = p.channels.includes(channel)
                    ? p.channels.filter(c => c !== channel)
                    : [...p.channels, channel];
                return { ...p, channels };
            })
        );
    };

    const savePreferences = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/notifications/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preferences,
                    quietFrom: globalQuietFrom,
                    quietTo: globalQuietTo,
                })
            });

            if (res.ok) {
                toast.success('Preferências guardadas');
            } else {
                toast.error('Erro ao guardar preferências');
            }
        } catch (error) {
            toast.error('Erro ao guardar preferências');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">A carregar preferências...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Preferências de Notificação
                    </CardTitle>
                    <CardDescription>
                        Configure quais notificações deseja receber e como.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Quiet Hours */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-sm">Horário Silencioso</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="quiet-from" className="text-sm text-gray-600">Das</Label>
                                <Input
                                    id="quiet-from"
                                    type="time"
                                    value={globalQuietFrom}
                                    onChange={(e) => setGlobalQuietFrom(e.target.value)}
                                    className="w-32"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="quiet-to" className="text-sm text-gray-600">às</Label>
                                <Input
                                    id="quiet-to"
                                    type="time"
                                    value={globalQuietTo}
                                    onChange={(e) => setGlobalQuietTo(e.target.value)}
                                    className="w-32"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Não receberá notificações push durante este período.
                        </p>
                    </div>

                    {/* Notification Types */}
                    <div className="space-y-4">
                        {NOTIFICATION_TYPES.map(type => {
                            const pref = preferences.find(p => p.type === type.id);
                            const Icon = type.icon;

                            return (
                                <div
                                    key={type.id}
                                    className={`p-4 border rounded-lg transition-colors ${pref?.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Icon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{type.label}</p>
                                                <p className="text-xs text-gray-500">{type.description}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={pref?.enabled || false}
                                            onCheckedChange={() => toggleType(type.id)}
                                        />
                                    </div>

                                    {pref?.enabled && (
                                        <div className="flex gap-2 ml-11">
                                            {CHANNELS.map(channel => {
                                                const isActive = pref.channels.includes(channel.id);
                                                const ChannelIcon = channel.icon;

                                                return (
                                                    <Badge
                                                        key={channel.id}
                                                        variant={isActive ? 'default' : 'outline'}
                                                        className={`cursor-pointer transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-100'}`}
                                                        onClick={() => toggleChannel(type.id, channel.id)}
                                                    >
                                                        <ChannelIcon className="h-3 w-3 mr-1" />
                                                        {channel.label}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Save Button */}
                    <Button onClick={savePreferences} disabled={saving} className="w-full">
                        {saving ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A guardar...</>
                        ) : (
                            <><Save className="h-4 w-4 mr-2" /> Guardar Preferências</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
