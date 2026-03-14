import SubmissionForm from '../components/submission-form';
import Feed from '../components/feed';
import { getFeed } from '../actions/get-feed';

export default async function Home() {
  const result = await getFeed(1);
  const initialApps = result.success ? result.data : [];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            repopo
          </h1>
          <p className="text-xl text-gray-500">
            Discover and share Github projects
          </p>
        </header>

        <SubmissionForm />
        
        <Feed initialApps={initialApps} />
      </div>
    </main>
  );
}
