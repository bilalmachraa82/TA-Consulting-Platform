
'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertTriangle, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    sentAt: string;
    readAt?: string | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
    AVISO_PRAZO_7D: Clock,
    DOCUMENTO_EXPIRA_30D: FileText,
    MILESTONE_ATRASADO: AlertTriangle,
    NOVO_MATCH_80: Target,
    CANDIDATURA_UPDATE: Check,
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.readAt).length;

    useEffect(() => {
        fetchNotifications();

        // Poll every 60s for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">A carregar...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Sem notificações</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const Icon = ICON_MAP[notification.type] || Bell;
                                const isUnread = !notification.readAt;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${isUnread ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => {
                                            if (isUnread) markAsRead(notification.id);
                                            if (notification.link) window.location.href = notification.link;
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`p-2 rounded-full ${isUnread ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${isUnread ? 'font-medium' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true, locale: pt })}
                                                </p>
                                            </div>
                                            {isUnread && (
                                                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <a href="/dashboard/configuracoes?tab=notifications">Ver todas as configurações</a>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
