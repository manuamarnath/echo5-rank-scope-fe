import React from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import TaskManagementDashboard from '../components/TaskManagementDashboard';

export default function Tasks() {
  return (
    <MainLayout>
      <TaskManagementDashboard />
    </MainLayout>
  );
}