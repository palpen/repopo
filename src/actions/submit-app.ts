'use server';

import { z } from 'zod';
import { parseGitHubUrl } from '../lib/github-url';
import { checkGitHubRepoExists } from '../lib/github-check';
import { appRepository } from '../repository/app-repository';
import { ActionResult, App } from '../lib/types';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const submitSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2048, 'URL is too long'),
});

export async function submitApp(url: string): Promise<ActionResult<App>> {
  try {
    const validated = submitSchema.safeParse({ url });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    const allowed = await appRepository.checkRateLimit(ip, 'submit', 10, 60 * 60 * 1000);
    if (!allowed) {
      return { success: false, error: "You're submitting too fast. Please try again later." };
    }

    const parsed = parseGitHubUrl(url);
    if ('error' in parsed) {
      return { success: false, error: parsed.error };
    }

    const existing = await appRepository.findByUrl(parsed.github_url);
    if (existing) {
      return { success: false, error: "This repository has already been submitted!" };
    }

    const checkResult = await checkGitHubRepoExists(parsed.owner, parsed.repo_name);
    if (!checkResult.exists) {
      if (checkResult.reason === 'not_found') {
        return { success: false, error: "This repository doesn't seem to exist on GitHub." };
      }
      return { success: false, error: "Could not verify the repository on GitHub. Please try again later." };
    }

    const app = await appRepository.create(parsed);

    revalidatePath('/');
    return { success: true, data: app };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}
