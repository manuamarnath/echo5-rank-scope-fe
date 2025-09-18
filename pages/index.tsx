import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to RankScope</h1>
      <p className="mb-6 text-lg">SEO SaaS for automated keyword allocation, content briefs, and reporting.</p>
      <div className="flex flex-col gap-4 items-center">
        <Link href="/dashboard" className="btn">Go to Dashboard</Link>
        <Link href="/pages" className="btn">View Pages</Link>
        <Link href="/tasks" className="btn">View Tasks</Link>
      </div>
    </main>
  );
}
