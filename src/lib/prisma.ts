import { PrismaClient } from '@prisma/client'
import { setDefaultResultOrder } from 'node:dns'

// Supabase's direct database hostname can return IPv6 before IPv4. Vercel
// functions currently have IPv4 egress, so make Prisma select the reachable
// address consistently instead of failing on the first IPv6 result.
setDefaultResultOrder('ipv4first')

const prismaClientSingleton = () => {
  return new PrismaClient();
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
