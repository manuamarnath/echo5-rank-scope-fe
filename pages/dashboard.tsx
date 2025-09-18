import React from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import MultiStepClientForm from '../components/MultiStepClientForm';
import HeatmapGrid from '../components/HeatmapGrid';
import TasksTable from '../components/TasksTable';
import ReportDownload from '../components/ReportDownload';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function Dashboard() {
  const { data: tasks, isLoading: loadingTasks } = useSWR('/tasks', fetcher);
  const { data: rankData, isLoading: loadingRank } = useSWR('/rank-tracking', fetcher);
  const { data: aiInsights, isLoading: loadingAI } = useSWR('/ai-insights', fetcher);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">RankScope Dashboard</h1>
      <section className="mb-8">
        <MultiStepClientForm />
      </section>
      <section className="mb-8">
        <HeatmapGrid />
      </section>
      <section className="mb-8">
        <TasksTable />
      </section>
      <section className="mb-8">
        <ReportDownload />
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Tasks</h2>
        {loadingTasks ? <div>Loading...</div> : (
          <ul className="list-disc ml-4">
            {tasks?.map((task: any) => (
              <li key={task.id}>{task.name} - <span className={task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>{task.status}</span></li>
            ))}
          </ul>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Rank Tracking</h2>
        {loadingRank ? <div>Loading...</div> : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rankData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rank" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">AI Overview Insights</h2>
        {loadingAI ? <div>Loading...</div> : (
          <div className="bg-gray-100 p-4 rounded">
            <pre>{JSON.stringify(aiInsights, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
