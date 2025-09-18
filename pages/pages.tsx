import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function PagesList() {
  const { data, error, isLoading } = useSWR('/pages', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading pages.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pages</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Keywords</th>
            <th>Brief</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((page: any) => (
            <tr key={page._id}>
              <td>{page.title}</td>
              <td>{page.type}</td>
              <td>{page.status}</td>
              <td>
                {page.keywords?.map((kw: any) => (
                  <span key={kw._id} className="px-2 py-1 bg-gray-100 rounded mr-1">{kw.text}</span>
                ))}
              </td>
              <td>
                {page.briefId ? (
                  <Link href={`/briefs/${page.briefId}`} className="text-blue-600 underline">View Brief</Link>
                ) : (
                  <span className="text-gray-400">No Brief</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
