'use client';

import { useState, useTransition, useCallback } from 'react';
import { App } from '../lib/types';
import { getFeed } from '../actions/get-feed';
import { searchApps } from '../actions/search-apps';
import RepoCard from './repo-card';
import SearchBar from './search-bar';

export default function Feed({ initialApps }: { initialApps: App[] }) {
  const [apps, setApps] = useState<App[]>(initialApps);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'new' | 'top'>('new');
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setPage(1);
    startTransition(async () => {
      if (!q) {
        const result = await getFeed(1, sort);
        if (result.success) setApps(result.data);
      } else {
        const result = await searchApps(q, 1);
        if (result.success) setApps(result.data);
      }
    });
  }, [sort]);

  const handleSort = (newSort: 'new' | 'top') => {
    if (newSort === sort) return;
    setSort(newSort);
    setPage(1);
    setQuery('');
    startTransition(async () => {
      const result = await getFeed(1, newSort);
      if (result.success) setApps(result.data);
    });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    startTransition(async () => {
      if (!query) {
        const result = await getFeed(nextPage, sort);
        if (result.success) setApps(prev => [...prev, ...result.data]);
      } else {
        const result = await searchApps(query, nextPage);
        if (result.success) setApps(prev => [...prev, ...result.data]);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <SearchBar onSearch={handleSearch} />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleSort('new')}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            sort === 'new'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          New
        </button>
        <button
          onClick={() => handleSort('top')}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            sort === 'top'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Top
        </button>
      </div>
      
      {isPending && <p className="text-gray-500 text-center mb-4">Loading...</p>}
      
      <div className="flex flex-col gap-4">
        {apps.length === 0 ? (
          <p className="text-center text-gray-500 py-8 border rounded border-dashed">
            {query ? "No repositories match your search." : "No repositories yet. Be the first to submit one!"}
          </p>
        ) : (
          apps.map(app => <RepoCard key={app.id} app={app} />)
        )}
      </div>

      {apps.length >= 20 && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
