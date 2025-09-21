import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import axios from 'axios';
import { Keyword } from '../src/components/keywords/interfaces';

interface Cluster {
  id: string;
  name: string;
}

interface Page {
  _id: string;
  title: string;
}

interface HeatmapData {
  pages: Page[];
  clusters: Cluster[];
  grid: {
    [pageId: string]: {
      [clusterId: string]: Keyword[];
    };
  };
}

const fetcher = (url: string) => axios.get<HeatmapData>(url).then(res => res.data);

export default function HeatmapGrid() {
  const { data, error, isLoading } = useSWR<HeatmapData>('/heatmap', fetcher);

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
            {data.clusters.map((cluster: Cluster) => (
              <th key={cluster.id}>{cluster.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.pages.map((page: Page) => (
            <tr key={page._id}>
              <td>{page.title}</td>
              {data.clusters.map((cluster: Cluster) => (
                <td key={cluster.id}>
                  {data.grid[page._id]?.[cluster.id]?.map((kw: Keyword) => (
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
