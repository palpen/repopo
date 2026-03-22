'use server';

import { z } from 'zod';
import { appRepository } from '../repository/app-repository';
import { ActionResult, App } from '../lib/types';

const searchSchema = z.object({
  query: z.string().max(200, 'Search query is too long'),
  page: z.number().int().min(1),
});

export async function searchApps(query: string, page: number): Promise<ActionResult<App[]>> {
  try {
    const validated = searchSchema.safeParse({ query, page });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return { success: true, data: [] };
    }

    const limit = 20;
    const offset = (validated.data.page - 1) * limit;
    const apps = await appRepository.search(cleanQuery, limit, offset);
    return { success: true, data: apps };
  } catch {
    return { success: false, error: "Failed to search applications." };
  }
}
