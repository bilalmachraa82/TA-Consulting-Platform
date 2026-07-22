import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

/**
 * Multi-tenant data scoping (transitional).
 *
 * Data is anchored on `Empresa.consultorId` — the tenant scheme already enforced on the
 * working routes (e.g. `empresas/by-consultor`). Rules:
 *  - **admin** → sees everything (no filter).
 *  - **consultor / user** → sees their own companies PLUS legacy *unowned* rows
 *    (`consultorId = null`). The null allowance keeps pre-existing single-tenant data
 *    visible until it is backfilled; new rows are owned on create, so isolation converges
 *    to strict over time. Once the data is backfilled, drop the `{ consultorId: null }`
 *    branch to make it strict.
 *  - **no session** → fails closed (matches nothing).
 *
 * Candidatura / Documento inherit tenancy through their `empresa` relation.
 */

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin'
}

/** Where-fragment for querying Empresa scoped to the caller's tenant. */
export function empresaScope(session: Session | null): Prisma.EmpresaWhereInput {
  if (isAdmin(session)) return {}
  const uid = session?.user?.id
  if (!uid) return { id: '__no_session__' } // fail closed: match nothing
  return { OR: [{ consultorId: uid }, { consultorId: null }] }
}

/** Where-fragment for Candidatura (tenancy inherited via its Empresa). */
export function candidaturaScope(session: Session | null): Prisma.CandidaturaWhereInput {
  if (isAdmin(session)) return {}
  const uid = session?.user?.id
  if (!uid) return { id: '__no_session__' }
  return { empresa: { OR: [{ consultorId: uid }, { consultorId: null }] } }
}

/** Where-fragment for Documento (tenancy inherited via its Empresa). */
export function documentoScope(session: Session | null): Prisma.DocumentoWhereInput {
  if (isAdmin(session)) return {}
  const uid = session?.user?.id
  if (!uid) return { id: '__no_session__' }
  return { empresa: { OR: [{ consultorId: uid }, { consultorId: null }] } }
}

/** Convenience: the current session (or null) in a route handler. */
export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}
