'use server';

import { z } from 'zod';
import { appRepository } from '../repository/app-repository';
import { headers } from 'next/headers';

const trackClickSchema = z.object({
  appId: z.string().uuid(),
});

export async function trackClick(appId: string): Promise<void> {
  try {
    const validated = trackClickSchema.safeParse({ appId });
    if (!validated.success) return;

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    await appRepository.trackUniqueClick(appId, ip);
  } catch (error) {
    console.error("Failed to track click", error);
  }
}
