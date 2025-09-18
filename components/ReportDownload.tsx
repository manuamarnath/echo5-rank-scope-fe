import React from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ReportDownload() {
  const { data, error, isLoading } = useSWR('/internal-report', fetcher);

  if (isLoading) return <div>Loading report...</div>;
  if (error) return <div>Error loading report.</div>;

  return (
    <div className="my-4">
      <h2 className="text-lg font-semibold mb-2">Internal Report</h2>
      <div>Total Pages: {data.totalPages}</div>
      <div>Total Keywords: {data.totalKeywords}</div>
      <div>Total Briefs: {data.totalBriefs}</div>
      <div>Total Tasks: {data.totalTasks}</div>
      <a href={data.reportUrl} target="_blank" rel="noopener" className="btn mt-2">Download Report</a>
    </div>
  );
}
