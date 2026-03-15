'use client';

import { useState, useTransition } from 'react';
import { submitApp } from '../actions/submit-app';
import { useRouter } from 'next/navigation';

export default function SubmissionForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!url) return;

    startTransition(async () => {
      const result = await submitApp(url);
      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess('Repository added!');
        setUrl('');
        router.refresh(); 
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400 text-sm mt-1">{success}</p>}
      </form>
    </div>
  );
}
