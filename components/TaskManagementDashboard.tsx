import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'content-creation' | 'seo-audit' | 'keyword-research' | 'technical-seo' | 'link-building';
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedBy: string;
  clientId: string;
  clientName: string;
  briefId?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  comments: Comment[];
  dependencies: string[];
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface TaskFilters {
  status: string[];
  priority: string[];
  assignee: string[];
  client: string[];
  type: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export default function TaskManagementDashboard() {
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar' | 'gantt'>('kanban');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filters] = useState<TaskFilters>({
    status: [],
    priority: [],
    assignee: [],
    client: [],
    type: [],
    dateRange: { start: '', end: '' }
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]); // Set empty array on error
      // Optionally show a toast or error message to user
    }
  };

  const applyFilters = React.useCallback(() => {
    let filtered = [...tasks];

    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(task => filters.assignee.includes(task.assignedTo));
    }
    if (filters.client.length > 0) {
      filtered = filtered.filter(task => filters.client.includes(task.clientId));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter(task => filters.type.includes(task.type));
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters, applyFilters]);

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  // Dummy handlers for removed state functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setSelectedTask = (_: Task) => {
    // Task selection functionality not implemented
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setShowTaskModal = (_: boolean) => {
    // Task modal functionality not implemented
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return '#6B7280';
      case 'in-progress': return '#3B82F6';
      case 'review': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'blocked': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'content-creation': return '✏️';
      case 'seo-audit': return '🔍';
      case 'keyword-research': return '📊';
      case 'technical-seo': return '⚙️';
      case 'link-building': return '🔗';
      default: return '📋';
    }
  };

  const renderKanbanView = () => {
    const columns: Array<{ status: Task['status']; title: string; color: string }> = [
      { status: 'todo', title: 'To Do', color: '#F3F4F6' },
      { status: 'in-progress', title: 'In Progress', color: '#EBF4FF' },
      { status: 'review', title: 'Review', color: '#FEF3C7' },
      { status: 'completed', title: 'Completed', color: '#ECFDF5' },
      { status: 'blocked', title: 'Blocked', color: '#FEE2E2' }
    ];

    return (
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '20px' }}>
        {columns.map(column => (
          <div
            key={column.status}
            style={{
              minWidth: '300px',
              backgroundColor: column.color,
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#1F2937'
            }}>
              {column.title} ({filteredTasks.filter(task => task.status === column.status).length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTasks
                .filter(task => task.status === column.status)
                .map(task => (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB'
                    }}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{getTypeIcon(task.type)}</span>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: '#1F2937',
                      lineHeight: '1.4'
                    }}>
                      {task.title}
                    </h4>
                    
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6B7280', 
                      marginBottom: '12px',
                      lineHeight: '1.4'
                    }}>
                      {task.description.substring(0, 100)}...
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {task.clientName}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>
                      Assigned to: {task.assignedTo.split('@')[0]}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Task
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Type
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Priority
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Assignee
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Client
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Due Date
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr
                key={task.id}
                style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }}
                onClick={() => setSelectedTask(task)}
              >
                <td style={{ padding: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {task.description.substring(0, 80)}...
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: '12px' }}>
                    {getTypeIcon(task.type)} {task.type.replace('-', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={task.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task.id, e.target.value as Task['status']);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '12px',
                      backgroundColor: getStatusColor(task.status),
                      color: 'white'
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '500',
                    backgroundColor: getPriorityColor(task.priority),
                    color: 'white'
                  }}>
                    {task.priority.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#6B7280' }}>
                  {task.assignedTo.split('@')[0]}
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#6B7280' }}>
                  {task.clientName}
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#6B7280' }}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '4px', 
                      backgroundColor: '#E5E7EB', 
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${task.estimatedHours > 0 ? (task.actualHours / task.estimatedHours) * 100 : 0}%`,
                        height: '100%',
                        backgroundColor: getStatusColor(task.status)
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      {task.actualHours}h/{task.estimatedHours}h
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>
              Task Management
            </h1>
            <button
              onClick={() => setShowTaskModal(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              + Create Task
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['kanban', 'list', 'calendar', 'gantt'].map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as typeof activeView)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeView === view ? '#EBF4FF' : 'transparent',
                    color: activeView === view ? '#3B82F6' : '#6B7280',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <select style={{
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
              
              <select style={{
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <option value="">All Assignees</option>
                <option value="sarah@agency.com">Sarah</option>
                <option value="mike@agency.com">Mike</option>
                <option value="jenny@agency.com">Jenny</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {activeView === 'kanban' && renderKanbanView()}
        {activeView === 'list' && renderListView()}
        {activeView === 'calendar' && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: '#6B7280' }}>Calendar View Coming Soon</h2>
          </div>
        )}
        {activeView === 'gantt' && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: '#6B7280' }}>Gantt Chart View Coming Soon</h2>
          </div>
        )}
      </div>
    </div>
  );
}