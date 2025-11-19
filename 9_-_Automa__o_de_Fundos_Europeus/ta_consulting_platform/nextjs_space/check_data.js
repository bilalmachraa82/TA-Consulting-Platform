require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const avisos = await prisma.aviso.count()
    const empresas = await prisma.empresa.count()
    const candidaturas = await prisma.candidatura.count()
    const memorias = await prisma.memoriaDescritiva.count()
    
    console.log('\n=== DADOS REAIS NA BASE DE DADOS ===')
    console.log('Avisos:', avisos)
    console.log('Empresas:', empresas)
    console.log('Candidaturas:', candidaturas)
    console.log('Memórias Descritivas:', memorias)
    console.log('===================================\n')
    
    // Mostrar alguns avisos para verificar dados reais
    if (avisos > 0) {
      const sampleAviso = await prisma.aviso.findFirst()
      console.log('Exemplo de Aviso (campos disponíveis):')
      console.log(Object.keys(sampleAviso))
    }
    
    // Verificar empresas
    if (empresas > 0) {
      const sampleEmpresas = await prisma.empresa.findMany({ take: 3 })
      console.log('\nEmpresas:')
      sampleEmpresas.forEach((e, i) => {
        console.log(`${i+1}. ${e.nome} (${e.dimensao || 'N/A'})`)
      })
    }
  } catch(e) {
    console.error('Erro:', e.message)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
