'use client';

import { useState } from 'react';
import { Lead } from '@prisma/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface LeadTableProps {
    leads: Lead[];
}

export function LeadTable({ leads }: LeadTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const filteredLeads = leads.filter((lead) => {
        const matchesSearch =
            (lead.nomeEmpresa?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.nif || '').includes(searchTerm);

        const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const exportCSV = () => {
        const headers = ['Data', 'NIF', 'Empresa', 'Email', 'Telefone', 'Distrito', 'Status', 'Score'];
        const csvContent = [
            headers.join(','),
            ...filteredLeads.map(lead => [
                new Date(lead.createdAt).toISOString(),
                lead.nif,
                `"${lead.nomeEmpresa || lead.nome}"`,
                lead.email,
                lead.telefone || '',
                lead.distrito || '',
                lead.status,
                lead.scoreElegibilidade
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Pesquisar empresas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-slate-900 border-slate-700 text-slate-200"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md text-sm px-3 py-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Todos os Estados</option>
                        <option value="NOVO">Novo</option>
                        <option value="CONTACTADO">Contactado</option>
                        <option value="QUALIFICADO">Qualificado</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={exportCSV} className="border-slate-700 hover:bg-slate-800 text-slate-200">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="border-slate-800 hover:bg-slate-800/50">
                            <TableHead className="text-slate-400">Data</TableHead>
                            <TableHead className="text-slate-400">Empresa</TableHead>
                            <TableHead className="text-slate-400">NIF</TableHead>
                            <TableHead className="text-slate-400">Contacto</TableHead>
                            <TableHead className="text-slate-400">Distrito</TableHead>
                            <TableHead className="text-slate-400">Score</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-slate-500">
                                    Nenhuma lead encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow key={lead.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="text-slate-300 font-mono text-xs">
                                        {format(new Date(lead.createdAt), 'dd/MM/yyyy', { locale: pt })}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-200">
                                        {lead.nomeEmpresa || lead.nome}
                                        {lead.tipoProjeto && (
                                            <div className="text-xs text-slate-500 mt-1">{lead.tipoProjeto}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-400 font-mono text-sm">{lead.nif}</TableCell>
                                    <TableCell className="text-slate-300 text-sm">
                                        <div className="flex flex-col">
                                            <span>{lead.email}</span>
                                            <span className="text-slate-500 text-xs">{lead.telefone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">{lead.distrito}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                            ${(lead.scoreElegibilidade || 0) >= 70 ? 'border-green-500 text-green-400 bg-green-500/10' :
                                                (lead.scoreElegibilidade || 0) >= 40 ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                                                    'border-slate-700 text-slate-400'}
                        `}>
                                            {lead.scoreElegibilidade}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0">
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700 hover:text-white">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-slate-500 text-right">
                Total: {filteredLeads.length} leads
            </div>
        </div>
    );
}
