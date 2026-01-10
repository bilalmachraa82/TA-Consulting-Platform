
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export type Role = "admin" | "consultor" | "user";

export async function withRoleProtection(
    allowedRoles: Role[],
    handler: (session: any) => Promise<NextResponse>
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Se user.role não existir, assumir 'user' default
    const userRole = (session.user as any).role || "user";

    if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
            { error: "Forbidden: Insufficient permissions" },
            { status: 403 }
        );
    }

    return handler(session);
}

// Helper para rotas de Admin
export function withAdminProtection(handler: (session: any) => Promise<NextResponse>) {
    return withRoleProtection(["admin"], handler);
}

// Helper para rotas de Consultor+
export function withConsultorProtection(handler: (session: any) => Promise<NextResponse>) {
    return withRoleProtection(["admin", "consultor"], handler);
}
