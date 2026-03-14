'use server';

import { recentSubmissions } from '../strategies/recent-submissions';
import { topSubmissions } from '../strategies/top-submissions';
import { ActionResult, App } from '../lib/types';

export async function getFeed(page: number, sort: 'new' | 'top' = 'new'): Promise<ActionResult<App[]>> {
  try {
    const limit = 20;
    const offset = (Math.max(1, page) - 1) * limit;
    const strategy = sort === 'top' ? topSubmissions : recentSubmissions;
    const apps = await strategy({ limit, offset });
    return { success: true, data: apps };
  } catch (error) {
    return { success: false, error: "Failed to fetch feed." };
  }
}
