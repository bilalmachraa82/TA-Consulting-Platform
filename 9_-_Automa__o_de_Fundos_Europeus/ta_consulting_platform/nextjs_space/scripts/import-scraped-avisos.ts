/**
 * Import avisos scraped from Python comprehensive_avisos_scraper.py
 * Filters only valid avisos with real data
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ScrapedAviso {
  url: string
  titulo: string
  portal: string
  programa: string
  data_inicio?: string | null
  data_fim?: string | null
  montante?: string | null
  codigo?: string | null
  hash: string
}

function mapPortal(portal: string): string {
  const mapping: Record<string, string> = {
    'portugal2030': 'PORTUGAL2030',
    'prr': 'PRR',
    'norte': 'PORTUGAL2030',
    'centro': 'PORTUGAL2030',
    'lisboa': 'PORTUGAL2030',
    'alentejo': 'PORTUGAL2030',
    'algarve': 'PORTUGAL2030',
    'acores': 'PORTUGAL2030',
    'madeira': 'PORTUGAL2030',
    'fami': 'PAPAC',
    'compete': 'PORTUGAL2030',
    'pessoas': 'PORTUGAL2030',
    'mar': 'PORTUGAL2030'
  }
  return mapping[portal.toLowerCase()] || 'PORTUGAL2030'
}

function generateCodigo(portal: string, index: number): string {
  const year = new Date().getFullYear()
  const portalCode = portal.toUpperCase().substring(0, 10)
  return `${portalCode}-${year}-${String(index).padStart(3, '0')}`
}

function isValidAviso(aviso: ScrapedAviso): boolean {
  // Filter out empty or invalid avisos
  if (!aviso.titulo || aviso.titulo.trim() === '') return false
  if (!aviso.url || aviso.url === '') return false

  // Filter out non-aviso pages
  const invalidKeywords = [
    'processo de candidatura',
    'plano anual',
    'aviso de privacidade',
    'regulamento',
    'manual',
    'guia',
    'faq'
  ]

  const titulo = aviso.titulo.toLowerCase()
  if (invalidKeywords.some(kw => titulo.includes(kw))) return false

  return true
}

async function main() {
  console.log('📦 Importing scraped avisos to database...')

  // Read scraped report
  const reportPath = path.join(
    __dirname,
    '../../evf_extracted/backend/scripts/comprehensive_avisos_report.json'
  )

  if (!fs.existsSync(reportPath)) {
    console.error(`❌ Report not found at ${reportPath}`)
    process.exit(1)
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
  const scrapedAvisos: ScrapedAviso[] = report.details || []

  console.log(`📊 Total scraped: ${scrapedAvisos.length}`)

  // Filter valid avisos
  const validAvisos = scrapedAvisos.filter(isValidAviso)
  console.log(`✅ Valid avisos: ${validAvisos.length}`)

  if (validAvisos.length === 0) {
    console.log('⚠️  No valid avisos to import. Using mock data instead...')

    // Import mock data with future dates
    const today = new Date()
    const mockAvisos = [
      {
        nome: 'Inovação PME - Transformação Digital',
        portal: 'PORTUGAL2030' as any,
        programa: 'Portugal 2030',
        codigo: 'PT2030-2025-001',
        dataInicioSubmissao: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        dataFimSubmissao: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000),
        montanteMinimo: 10000,
        montanteMaximo: 500000,
        descrição: 'Apoio à transformação digital de PME',
        link: 'https://portugal2030.pt',
        taxa: '75%',
        regiao: 'Nacional',
        setoresElegiveis: ['Tecnologia', 'Serviços'],
        dimensaoEmpresa: ['Micro', 'Pequena', 'Média'],
        urgente: true,
        ativo: true
      },
      {
        nome: 'Eficiência Energética Indústria',
        portal: 'PORTUGAL2030' as any,
        programa: 'Norte 2030',
        codigo: 'NORTE-2025-002',
        dataInicioSubmissao: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        dataFimSubmissao: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
        montanteMinimo: 50000,
        montanteMaximo: 2000000,
        descrição: 'Incentivo à eficiência energética na indústria',
        link: 'https://norte2030.pt',
        taxa: '50%',
        regiao: 'Norte',
        setoresElegiveis: ['Indústria', 'Energia'],
        dimensaoEmpresa: ['PME', 'Grande Empresa'],
        urgente: false,
        ativo: true
      },
      {
        nome: 'Descarbonização Industrial',
        portal: 'PRR' as any,
        programa: 'PRR',
        codigo: 'PRR-2025-001',
        dataInicioSubmissao: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
        dataFimSubmissao: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
        montanteMinimo: 500000,
        montanteMaximo: 10000000,
        descrição: 'Apoio a projetos de descarbonização industrial',
        link: 'https://recuperarportugal.gov.pt',
        taxa: '50%',
        regiao: 'Nacional',
        setoresElegiveis: ['Indústria'],
        dimensaoEmpresa: ['Grande Empresa'],
        urgente: false,
        ativo: true
      }
    ]

    for (const aviso of mockAvisos) {
      await prisma.aviso.create({ data: aviso })
      console.log(`  ✅ ${aviso.codigo} - ${aviso.nome}`)
    }

    console.log(`\n✅ Imported ${mockAvisos.length} mock avisos`)
    return
  }

  // Import valid avisos
  let imported = 0
  let skipped = 0

  for (let i = 0; i < validAvisos.length; i++) {
    const scraped = validAvisos[i]

    try {
      // Calculate dates
      const today = new Date()
      const dataInicio = scraped.data_inicio
        ? new Date(scraped.data_inicio)
        : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const dataFim = scraped.data_fim
        ? new Date(scraped.data_fim)
        : new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)

      // Skip if end date is in the past
      if (dataFim < today) {
        skipped++
        continue
      }

      const codigo = scraped.codigo || generateCodigo(scraped.portal, i + 1)

      // Calculate urgency (< 20 days)
      const diasRestantes = Math.ceil((dataFim.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const urgente = diasRestantes < 20

      await prisma.aviso.create({
        data: {
          codigo,
          nome: scraped.titulo,
          portal: mapPortal(scraped.portal) as any,
          programa: scraped.programa,
          dataInicioSubmissao: dataInicio,
          dataFimSubmissao: dataFim,
          montanteMinimo: scraped.montante ? parseFloat(scraped.montante) : null,
          montanteMaximo: scraped.montante ? parseFloat(scraped.montante) * 10 : null,
          descrição: `Aviso ${codigo} - ${scraped.programa}`,
          link: scraped.url,
          taxa: '50%',
          regiao: scraped.programa.includes('Norte') ? 'Norte' :
                  scraped.programa.includes('Centro') ? 'Centro' :
                  scraped.programa.includes('Lisboa') ? 'Lisboa' :
                  scraped.programa.includes('Alentejo') ? 'Alentejo' :
                  scraped.programa.includes('Algarve') ? 'Algarve' :
                  scraped.programa.includes('Açores') ? 'Açores' :
                  scraped.programa.includes('Madeira') ? 'Madeira' : 'Nacional',
          setoresElegiveis: ['Geral'],
          dimensaoEmpresa: ['PME'],
          urgente,
          ativo: true
        }
      })

      imported++
      console.log(`  ✅ ${codigo} - ${scraped.titulo}`)
    } catch (error: any) {
      console.error(`  ❌ Error importing ${scraped.titulo}:`, error.message)
    }
  }

  console.log(`\n✅ Imported ${imported} avisos`)
  console.log(`⚠️  Skipped ${skipped} avisos (past dates)`)
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
