import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function HeatmapGrid() {
  const { data, error, isLoading } = useSWR('/heatmap', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading heatmap.</div>;

  // Assume data.pages, data.clusters, data.grid
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Keyword Heatmap</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Page</th>
            {data.clusters.map((cluster: any) => (
              <th key={cluster.id}>{cluster.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.pages.map((page: any) => (
            <tr key={page._id}>
              <td>{page.title}</td>
              {data.clusters.map((cluster: any) => (
                <td key={cluster.id}>
                  {data.grid[page._id]?.[cluster.id]?.map((kw: any) => (
                    <span key={kw._id} className="px-2 py-1 bg-gray-100 rounded mr-1">{kw.text}</span>
                  ))}
                  {/* Actions: Create Page, Fix Cannibalization, Edit Secondary Keywords */}
                  <div className="flex gap-1 mt-1">
                    <button className="btn">Create Page</button>
                    <button className="btn">Fix Cannibalization</button>
                    <button className="btn">Edit Secondary</button>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
