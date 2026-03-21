# Suggested Improvements for repopo

## Critical (Security & Reliability)

### 1. In-Memory Rate Limiting Doesn't Work in Production
**File:** `src/actions/submit-app.ts:10`

The `rateLimitMap` is an in-memory `Map` that resets on every server restart and isn't shared across instances. In serverless environments (Vercel), each invocation may get a fresh instance, making this effectively useless.

**Fix:** Use database-backed rate limiting (add a `RateLimit` table with IP + timestamp) or use Redis/Upstash for distributed rate limiting.

### 2. GitHub Repo Check is Fragile and Rate-Limited
**File:** `src/lib/github-check.ts`

- Uses an unauthenticated HEAD request to `github.com`, which GitHub rate-limits to 60 requests/hour
- Network errors (timeout, DNS failure) are silently treated as "repo doesn't exist," which is misleading to users
- HEAD requests to `github.com` may behave differently than the API

**Fix:** Use the GitHub API (`https://api.github.com/repos/{owner}/{repo}`) and support a `GITHUB_TOKEN` env var for higher rate limits. Distinguish between "repo not found" and "check failed" errors.

### 3. Click Tracking is Gameable
**File:** `src/components/repo-card.tsx:8`

Every click fires `trackClick` with no deduplication. A user can inflate any repo's click count by simply clicking the link repeatedly.

**Fix:** Track unique clicks by IP or session. Add a `Click` table with `(app_id, ip_hash, created_at)` and a unique constraint on `(app_id, ip_hash)` to count unique visitors instead.

### 4. No Input Validation on Server Actions
**Files:** `src/actions/submit-app.ts`, `src/actions/search-apps.ts`

No length limits on URLs or search queries. Malicious users could send extremely large payloads.

**Fix:** Add Zod validation at the server action boundary:
```ts
const submitSchema = z.object({ url: z.string().max(2048).url() });
const searchSchema = z.object({ query: z.string().max(200) });
```

## Bugs

### 5. "Load More" Button Shows When No More Results Exist
**File:** `src/components/feed.tsx:99`

`apps.length >= 20` checks total loaded count, not whether the last page returned results. After loading 40 items across 2 pages, the button persists even if there are no more results.

**Fix:** Track `hasMore` state based on whether the last fetch returned a full page (20 items).

### 6. `timeAgo` Displays "1 days ago" Instead of "1 day ago"
**File:** `src/components/repo-card.tsx:11-24`

The `> 1` threshold means values like 1.5 display as "1 days ago" (plural). Affects all time units.

**Fix:** Use `Math.floor(interval)` for the check and handle singular vs plural:
```ts
const n = Math.floor(interval);
if (n >= 1) return n === 1 ? "1 day ago" : `${n} days ago`;
```

### 7. Search Strips Hyphens and Dots from Queries
**File:** `src/repository/app-repository.ts:39`

The regex `/[^\w\s]/gi` removes `-` and `.`, which are extremely common in repo names (`next.js`, `vue-router`, `date-fns`). Users searching for these repos won't find them.

**Fix:** Allow hyphens and dots: `/[^\w\s.\-]/gi`

## Code Quality

### 8. No Tests
There are zero test files. `parseGitHubUrl` and search query sanitization are pure functions that are easy to unit test and are the most critical pieces for correctness.

**Fix:** Add Vitest, write tests for URL parsing edge cases and search sanitization.

### 9. Unsafe Type Cast in Data Layer
**File:** `src/repository/app-repository.ts:10`

`new PrismaPg(pool as any)` bypasses type checking, likely due to a version mismatch between `pg` and `@prisma/adapter-pg`.

**Fix:** Pin compatible versions or use a proper type assertion with a comment explaining why.

## UX & SEO

### 10. No Social Sharing Metadata
**File:** `src/app/page.tsx`

No `<meta>` description, Open Graph tags, or Twitter cards. Links shared on social media will have no preview.

**Fix:** Add metadata export to the page/layout:
```ts
export const metadata = {
  title: 'repopo - Discover and share GitHub projects',
  description: 'A community-driven platform for discovering and sharing GitHub repositories.',
  openGraph: { title: '...', description: '...' },
};
```
