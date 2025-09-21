import React from 'react';
import useSWR from 'swr';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  status: string;
  assignedTo?: {
    name: string;
  };
  pageId?: {
    title: string;
  };
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function TasksTable() {
  const { data, error, isLoading } = useSWR('/tasks', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Tasks</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Page</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((task: Task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.status}</td>
              <td>{task.assignedTo?.name || '-'}</td>
              <td>{task.pageId?.title || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
