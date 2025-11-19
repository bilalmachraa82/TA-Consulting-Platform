'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, Building2 } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { updateUserRole, assignCompanyToUser, removeCompanyFromUser } from '@/app/actions/users';
import { toast } from 'sonner';

interface UserWithCompanies {
    id: string;
    role: UserRole;
    empresas: { id: string; nome: string }[];
}

interface Company {
    id: string;
    nome: string;
}

export function UserManagementActions({ user, allCompanies }: { user: UserWithCompanies, allCompanies: Company[] }) {
    const [loading, setLoading] = useState(false);

    const handleRoleChange = async (newRole: UserRole) => {
        setLoading(true);
        const res = await updateUserRole(user.id, newRole);
        setLoading(false);
        if (res.success) toast.success(`Função alterada para ${newRole}`);
        else toast.error('Erro ao atualizar função');
    };

    const handleCompanyToggle = async (companyId: string, isAssigned: boolean) => {
        setLoading(true);
        let res;
        if (isAssigned) {
            res = await removeCompanyFromUser(user.id, companyId);
        } else {
            res = await assignCompanyToUser(user.id, companyId);
        }
        setLoading(false);

        if (res.success) toast.success(isAssigned ? 'Empresa removida' : 'Empresa atribuída');
        else toast.error('Erro ao atualizar atribuição');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Ações de Gestão</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Função
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleRoleChange('ADMIN')} disabled={user.role === 'ADMIN'}>
                    Promover a Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('MANAGER')} disabled={user.role === 'MANAGER'}>
                    Mudar para Gestor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('CONSULTANT')} disabled={user.role === 'CONSULTANT'}>
                    Mudar para Consultor
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-3 w-3" /> Atribuir Empresas
                </DropdownMenuLabel>
                <div className="max-h-48 overflow-y-auto">
                    {allCompanies.map(company => {
                        const isAssigned = user.empresas.some(e => e.id === company.id);
                        return (
                            <DropdownMenuCheckboxItem
                                key={company.id}
                                checked={isAssigned}
                                onCheckedChange={() => handleCompanyToggle(company.id, isAssigned)}
                            >
                                {company.nome}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
