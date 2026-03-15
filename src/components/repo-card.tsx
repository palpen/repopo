'use client';

import { App } from '../lib/types';
import { trackClick } from '../actions/track-click';

export default function RepoCard({ app }: { app: App }) {
  const handleClick = () => {
    trackClick(app.id);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">
          <a
            href={app.github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {app.owner}/{app.repo_name}
          </a>
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Submitted {timeAgo(app.created_at)}</p>
      </div>
      <div>
        <span className="text-gray-400 dark:text-gray-500 text-sm">{app.click_count} clicks</span>
      </div>
    </div>
  );
}
