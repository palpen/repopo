'use server';

import { z } from 'zod';
import { recentSubmissions } from '../strategies/recent-submissions';
import { topSubmissions } from '../strategies/top-submissions';
import { ActionResult, App } from '../lib/types';

const feedSchema = z.object({
  page: z.number().int().min(1),
  sort: z.enum(['new', 'top']),
});

export async function getFeed(page: number, sort: 'new' | 'top' = 'new'): Promise<ActionResult<App[]>> {
  try {
    const validated = feedSchema.safeParse({ page, sort });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const limit = 20;
    const offset = (validated.data.page - 1) * limit;
    const strategy = validated.data.sort === 'top' ? topSubmissions : recentSubmissions;
    const apps = await strategy({ limit, offset });
    return { success: true, data: apps };
  } catch {
    return { success: false, error: "Failed to fetch feed." };
  }
}
