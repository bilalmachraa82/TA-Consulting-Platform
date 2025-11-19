require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 5, select: { email: true, name: true } })
    console.log('\n=== USERS NA BASE DE DADOS ===')
    users.forEach((u, i) => {
      console.log(`${i+1}. ${u.email} (${u.name || 'N/A'})`)
    })
    console.log('================================\n')
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
