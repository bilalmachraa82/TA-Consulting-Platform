import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@prisma/client';
import { UserManagementActions } from './user-actions'; // Client component we'll create next

export default async function UsersPage() {
    const users = await db.user.findMany({
        include: {
            empresas: {
                select: { id: true, nome: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const allCompanies = await db.empresa.findMany({
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' }
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipa</h1>
                    <p className="text-muted-foreground">
                        Gerir permissões de acesso e atribuição de clientes aos consultores.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Utilizadores ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Função (Role)</TableHead>
                                <TableHead>Empresas Atribuídas</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || 'Sem Nome'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'MANAGER' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.empresas.length > 0 ? (
                                                user.empresas.map(emp => (
                                                    <Badge key={emp.id} variant="outline" className="text-xs">
                                                        {emp.nome}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs">Nenhuma</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <UserManagementActions user={user} allCompanies={allCompanies} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
