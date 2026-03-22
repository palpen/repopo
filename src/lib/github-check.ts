export type GitHubCheckResult =
  | { exists: true }
  | { exists: false; reason: 'not_found' | 'check_failed' };

export async function checkGitHubRepoExists(owner: string, repoName: string): Promise<GitHubCheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'repopo',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { exists: true };
    }

    if (response.status === 404) {
      return { exists: false, reason: 'not_found' };
    }

    // Rate limited or other server error — don't assume repo doesn't exist
    return { exists: false, reason: 'check_failed' };
  } catch {
    return { exists: false, reason: 'check_failed' };
  }
}
