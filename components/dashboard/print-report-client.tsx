'use client'

import { useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PrintData {
    date: string
    kpis: {
        totalAvisos: number
        totalCandidaturas: number
        novasEmpresas: number
        totalFinanciamento: number
    }
    candidaturas: Array<{
        id: string
        empresa: string
        aviso: string
        estado: string
        data: string
    }>
    avisos: Array<{
        nome: string
        codigo: string
        prazo: string
    }>
}

export function PrintReportClient({ data }: { data: PrintData }) {
    useEffect(() => {
        // Auto-print when mounted
        setTimeout(() => {
            window.print()
        }, 500)
    }, [])

    return (
        <div className="p-8 max-w-[210mm] mx-auto bg-white min-h-screen text-black">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">TA Consulting Platform</h1>
                    <p className="text-sm text-slate-500">Relatório Executivo Mensal</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold">Data de Emissão</p>
                    <p className="text-lg">{data.date}</p>
                </div>
            </div>

            {/* KPIS */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 border rounded-lg bg-slate-50">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Avisos Ativos</p>
                    <p className="text-2xl font-bold">{data.kpis.totalAvisos}</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Candidaturas</p>
                    <p className="text-2xl font-bold">{data.kpis.totalCandidaturas}</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Novas Empresas</p>
                    <p className="text-2xl font-bold">{data.kpis.novasEmpresas}</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Pipeline (€)</p>
                    <p className="text-2xl font-bold">€{(data.kpis.totalFinanciamento).toLocaleString()}</p>
                </div>
            </div>

            {/* Candidaturas Table */}
            <section className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-600 pl-3">Atividade Recente</h2>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-100">
                                <TableHead className="font-bold text-black">Empresa</TableHead>
                                <TableHead className="font-bold text-black">Aviso</TableHead>
                                <TableHead className="font-bold text-black">Estado</TableHead>
                                <TableHead className="font-bold text-black text-right">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.candidaturas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                                        Sem candidaturas neste período.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.candidaturas.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.empresa}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{c.aviso}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-200">
                                                {c.estado}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">{c.data}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* Avisos Grid */}
            <section>
                <h2 className="text-xl font-bold mb-4 border-l-4 border-purple-600 pl-3">Próximos Deadlines</h2>
                <div className="grid grid-cols-1 gap-2">
                    {data.avisos.map((a, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border-b border-dashed border-slate-300">
                            <div>
                                <p className="font-bold text-sm">{a.nome}</p>
                                <p className="text-xs text-slate-500">{a.codigo}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono bg-red-50 text-red-600 px-2 py-1 rounded">
                                    {a.prazo}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-slate-400 border-t pt-4">
                <p>Gerado automaticamente por TA Consulting Platform (AI Powered)</p>
                <p>Documento Confidencial</p>
            </div>
        </div>
    )
}
