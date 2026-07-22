import { describe, it, expect } from 'vitest'
import { empresaScope, candidaturaScope, documentoScope, isAdmin } from '@/lib/auth/tenant'
import type { Session } from 'next-auth'

const admin = { user: { id: 'a1', email: 'a@x.pt', role: 'admin' } } as Session
const consultor = { user: { id: 'c1', email: 'c@x.pt', role: 'consultor' } } as Session

describe('tenant scoping (isolamento de dados)', () => {
  it('admin vê tudo (where vazio)', () => {
    expect(empresaScope(admin)).toEqual({})
    expect(candidaturaScope(admin)).toEqual({})
    expect(documentoScope(admin)).toEqual({})
    expect(isAdmin(admin)).toBe(true)
  })

  it('consultor vê as suas empresas + legacy sem dono', () => {
    expect(empresaScope(consultor)).toEqual({ OR: [{ consultorId: 'c1' }, { consultorId: null }] })
    expect(isAdmin(consultor)).toBe(false)
  })

  it('candidatura/documento herdam tenancy via empresa', () => {
    const inner = { OR: [{ consultorId: 'c1' }, { consultorId: null }] }
    expect(candidaturaScope(consultor)).toEqual({ empresa: inner })
    expect(documentoScope(consultor)).toEqual({ empresa: inner })
  })

  it('sem sessão → fail closed (não devolve nada)', () => {
    expect(empresaScope(null)).toEqual({ id: '__no_session__' })
    expect(candidaturaScope(null)).toEqual({ id: '__no_session__' })
    expect(documentoScope(null)).toEqual({ id: '__no_session__' })
  })

  it('sessão sem id → fail closed', () => {
    expect(empresaScope({ user: { role: 'consultor' } } as unknown as Session)).toEqual({ id: '__no_session__' })
  })
})
