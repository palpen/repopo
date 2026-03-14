import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { App, ParsedGitHubUrl } from '../lib/types';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const appRepository = {
  async create(data: ParsedGitHubUrl): Promise<App> {
    return await prisma.app.create({
      data: {
        github_url: data.github_url,
        owner: data.owner,
        repo_name: data.repo_name,
      },
    });
  },

  async findByUrl(github_url: string): Promise<App | null> {
    return await prisma.app.findUnique({
      where: { github_url },
    });
  },

  async findById(id: string): Promise<App | null> {
    return await prisma.app.findUnique({
      where: { id },
    });
  },

  async search(query: string, limit: number, offset: number): Promise<App[]> {
    const safeQuery = query.replace(/[^\w\s]/gi, '').trim().split(/\s+/).join(' | ');
    if (!safeQuery) return [];
    
    return await prisma.$queryRaw<App[]>`
      SELECT * FROM "App"
      WHERE to_tsvector('english', owner || ' ' || repo_name) @@ to_tsquery('english', ${safeQuery})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  },

  async findRecent(limit: number, offset: number): Promise<App[]> {
    return await prisma.app.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  async findTop(limit: number, offset: number): Promise<App[]> {
    return await prisma.app.findMany({
      orderBy: { click_count: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  async incrementClickCount(id: string): Promise<void> {
    await prisma.app.update({
      where: { id },
      data: { click_count: { increment: 1 } },
    });
  }
};
