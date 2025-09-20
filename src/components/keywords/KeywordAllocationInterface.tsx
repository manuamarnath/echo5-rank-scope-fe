import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import * as KeywordService from '../../../services/keywordService';

// These interfaces are already defined in this file, so we can remove this import



 interface Keyword {
   id?: string;
   _id?: string;
   text: string;
   intent?: string;
   searchVolume?: number;
   volume?: number;
   difficulty?: number;
   geo?: string;
   allocatedTo?: string;
   role?: 'owner' | 'employee' | 'client';
   status?: 'pending' | 'allocated' | 'in-progress' | 'completed';
   isPrimary?: boolean;
 }

 interface Client {
   _id: string;
   name: string;
   industry: string;
   website?: string;
   locations?: Array<{
     city: string;
     state: string;
     country: string;
     radius?: number;
     radiusUnit?: string;
   }>;
   services?: string[];
   competitors?: string[];
 }

 interface TeamMember {
   id: string;
   name: string;
   email: string;
   role: 'owner' | 'employee' | 'client';
 }
 
 interface KeywordAllocationProps {
   onClose?: () => void;
   clientId?: string;
 }

import { Box, Tabs, Tab, Paper, Grid, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Badge, Stack } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

export default function KeywordAllocationInterface({ onClose, clientId }: KeywordAllocationProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [bulkText, setBulkText] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [allocationTarget, setAllocationTarget] = useState('');
  const [allocationRole, setAllocationRole] = useState<'owner' | 'employee' | 'client'>('employee');
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<'upload' | 'allocate' | 'manage'>('manage');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientKeywords, setClientKeywords] = useState<Keyword[]>([]);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    text: '',
    intent: 'informational',
    geo: '',
    volume: '',
    difficulty: ''
  });

  // Mock team members - in real app, this would come from API
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'employee' },
    { id: '3', name: 'Client User', email: 'client@example.com', role: 'client' },
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientKeywords(selectedClientId);
    } else {
      setClientKeywords([]);
    }
  }, [selectedClientId]);

  const fetchClients = async () => {
    try {
      let response = await fetch('/api/clients/demo');
      if (!response.ok) {
        response = await fetch('http://localhost:5000/clients/demo');
      }
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (error) {
      setClients([]);
    }
  };

  const fetchClientKeywords = async (clientId: string) => {
    try {
      const response = await fetch(`/api/keywords?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        // Handle paginated response structure
        setClientKeywords(data.data || []);
      } else {
        setClientKeywords([]);
      }
    } catch (error) {
      setClientKeywords([]);
    }
  };

  const createKeyword = async () => {
    if (!selectedClientId || !newKeyword.text.trim()) return;
    
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          text: newKeyword.text.trim(),
          intent: newKeyword.intent,
          geo: newKeyword.geo || null,
          volume: newKeyword.volume ? parseInt(newKeyword.volume) : null,
          difficulty: newKeyword.difficulty ? parseInt(newKeyword.difficulty) : null
        })
      });

      if (response.ok) {
        setNewKeyword({ text: '', intent: 'informational', geo: '', volume: '', difficulty: '' });
        fetchClientKeywords(selectedClientId);
        setIsEditModalOpen(false);
        fetchClientKeywords(selectedClientId);
        fetchClientKeywords(selectedClientId);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create keyword');
      }
    } catch (error) {
      alert('Failed to create keyword');
    }
  };

  const updateKeyword = async () => {
    if (!editingKeyword) return;
    
    try {
      const response = await fetch(`/api/keywords/${editingKeyword._id || editingKeyword.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editingKeyword.text,
          intent: editingKeyword.intent,
          geo: editingKeyword.geo,
          volume: editingKeyword.searchVolume,
          difficulty: editingKeyword.difficulty
        })
      });

      if (response.ok) {
        setEditingKeyword(null);
        setIsEditModalOpen(false);
        fetchClientKeywords(selectedClientId);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update keyword');
      }
    } catch (error) {
      alert('Failed to update keyword');
    }
  };

  const deleteKeyword = async (keywordId: string) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    
    try {
      const response = await fetch(`/api/keywords/${keywordId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchClientKeywords(selectedClientId);
      } else {
        alert('Failed to delete keyword');
      }
    } catch (error) {
      alert('Failed to delete keyword');
    }
  };

  const processKeywords = () => {
    if (!bulkText.trim()) return;

    const keywordLines = bulkText.split('\n').filter(line => line.trim());
    const newKeywords: Keyword[] = keywordLines.map((line, index) => {
      // Parse potential CSV format: keyword, intent, volume, difficulty, geo
      const parts = line.split(',').map(part => part.trim());
      const keyword = parts[0];
      
      return {
        id: `kw-${Date.now()}-${index}`,
        text: keyword,
        intent: (parts[1] as any) || 'informational',
        searchVolume: parts[2] ? parseInt(parts[2]) : undefined,
        difficulty: parts[3] ? parseInt(parts[3]) : undefined,
        geo: parts[4] || undefined,
        status: 'pending' as const
      };
    });

    setKeywords(prev => [...prev, ...newKeywords]);
    setBulkText('');
  };

  // Select/deselect keywords
  const toggleKeywordSelection = (keywordId: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keywordId)
        ? prev.filter(id => id !== keywordId)
        : [...prev, keywordId]
    );
  };

  // Allocate selected keywords to a team member
  const allocateSelectedKeywords = () => {
    if (!allocationTarget || selectedKeywords.length === 0) return;
    setProcessing(true);
    setTimeout(() => {
      setKeywords(prev => prev.map(kw =>
        selectedKeywords.includes(kw.id || kw._id)
          ? { ...kw, allocatedTo: allocationTarget, role: allocationRole, status: 'allocated' as const }
          : kw
      ));
      setSelectedKeywords([]);
      setProcessing(false);
    }, 1000);
  };

  const renderUploadView = () => (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Upload Keywords
      </h3>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
        Select Client
      </label>
      <select
        value={selectedClientId}
        onChange={e => setSelectedClientId(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginBottom: '1rem' }}
      >
        <option value="">Select client...</option>
        {clients.map(client => (
          <option key={client._id} value={client._id}>{client.name}</option>
        ))}
      </select>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Add keywords one per line, or use CSV format: keyword, intent, volume, difficulty, geo
      </p>
      <textarea
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        rows={10}
        style={{ 
          width: '100%', 
          padding: '0.75rem', 
          border: '1px solid #d1d5db', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}
        placeholder={"SEO services\ncontent marketing, commercial, 1200, 45, New York\ndigital marketing agency, commercial, 2300, 67, USA\nhow to improve SEO, informational, 890, 32"}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          onClick={processKeywords}
          disabled={!bulkText.trim() || !selectedClientId}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: bulkText.trim() && selectedClientId ? '#4f46e5' : '#9ca3af', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.375rem',
            cursor: bulkText.trim() && selectedClientId ? 'pointer' : 'not-allowed'
          }}
        >
          Process Keywords
        </button>
        <button
          onClick={() => setView('allocate')}
          disabled={keywords.length === 0}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: keywords.length > 0 ? '#10b981' : '#9ca3af', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.375rem',
            cursor: keywords.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Allocate Keywords ({keywords.length})
        </button>
      </div>
    </div>
  );

  const renderManageView = () => (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Manage Keywords
      </h3>
      
      {/* Client Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Select Client
        </label>
        <select
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '0.375rem'
          }}
        >
          <option value="">Select client...</option>
          {clients.map(client => (
            <option key={client._id} value={client._id}>{client.name}</option>
          ))}
        </select>
      </div>

      {selectedClientId && (
        <>
          {/* Add New Keyword Form */}
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              Add New Keyword
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Keyword
                </label>
                <input
                  type="text"
                  value={newKeyword.text}
                  onChange={e => setNewKeyword(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter keyword..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Intent
                </label>
                <select
                  value={newKeyword.intent}
                  onChange={e => setNewKeyword(prev => ({ ...prev, intent: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="informational">Informational</option>
                  <option value="transactional">Transactional</option>
                  <option value="navigational">Navigational</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Volume
                </label>
                <input
                  type="number"
                  value={newKeyword.volume}
                  onChange={e => setNewKeyword(prev => ({ ...prev, volume: e.target.value }))}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Difficulty
                </label>
                <input
                  type="number"
                  value={newKeyword.difficulty}
                  onChange={e => setNewKeyword(prev => ({ ...prev, difficulty: e.target.value }))}
                  placeholder="0"
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={newKeyword.geo}
                  onChange={e => setNewKeyword(prev => ({ ...prev, geo: e.target.value }))}
                  placeholder="Location"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <button
                onClick={createKeyword}
                disabled={!newKeyword.text.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: newKeyword.text.trim() ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: newKeyword.text.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Keywords List */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1rem' 
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>
                Keywords ({clientKeywords.length})
              </h4>
            </div>

            {clientKeywords.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                No keywords found for this client. Add your first keyword above.
              </div>
            ) : (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', 
                  gap: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  <div>Keyword</div>
                  <div>Intent</div>
                  <div>Volume</div>
                  <div>Difficulty</div>
                  <div>Location</div>
                  <div>Actions</div>
                </div>

                {/* Table Rows */}
                {clientKeywords.map((keyword, index) => (
                  <div 
                    key={keyword._id || keyword.id} 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', 
                      gap: '1rem',
                      padding: '0.75rem',
                      borderBottom: index < clientKeywords.length - 1 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: 'white',
                      fontSize: '0.875rem',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{keyword.text}</div>
                    <div style={{ color: '#6b7280' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: keyword.intent === 'transactional' ? '#dbeafe' : 
                                       keyword.intent === 'commercial' ? '#fef3c7' : 
                                       keyword.intent === 'navigational' ? '#e0e7ff' : '#f3f4f6',
                        color: keyword.intent === 'transactional' ? '#1e40af' : 
                               keyword.intent === 'commercial' ? '#92400e' : 
                               keyword.intent === 'navigational' ? '#3730a3' : '#374151',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {keyword.intent || 'informational'}
                      </span>
                    </div>
                    <div style={{ color: '#6b7280' }}>{keyword.volume || keyword.searchVolume || '-'}</div>
                    <div style={{ color: '#6b7280' }}>{keyword.difficulty || '-'}</div>
                    <div style={{ color: '#6b7280' }}>{keyword.geo || '-'}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingKeyword({...keyword, searchVolume: keyword.volume || keyword.searchVolume});
                          setIsEditModalOpen(true);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteKeyword(keyword._id || keyword.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Allocation UI
  const renderAllocationView = () => (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Onboarding Keywords for Selected Client</h4>
        {(clientKeywords || []).length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>No onboarding keywords found for this client.</div>
        ) : (
          <div style={{ maxHeight: '180px', overflowY: 'auto', border: '2px solid #6366f1', borderRadius: '0.5rem', marginBottom: '1rem', background: '#f5f3ff' }}>
            {(clientKeywords || []).map((kw) => (
              <div key={kw.id || kw._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #e0e7ff', backgroundColor: selectedKeywords.includes(kw.id || kw._id) ? '#e0e7ff' : 'transparent', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }} onClick={() => toggleKeywordSelection(kw.id || kw._id)}>
                  <input type="checkbox" checked={selectedKeywords.includes(kw.id || kw._id)} readOnly style={{ marginRight: '0.75rem' }} />
                  <span style={{ fontWeight: '500', marginRight: '0.5rem' }}>{kw.text}</span>
                  {kw.isPrimary ? (
                    <span style={{ marginRight: '0.5rem', background: '#dbeafe', color: '#2563eb', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '0.25rem' }}>Primary</span>
                  ) : (
                    <span style={{ marginRight: '0.5rem', background: '#dcfce7', color: '#059669', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '0.25rem' }}>Seed</span>
                  )}
                  {kw.intent && (
                    <span style={{ marginRight: '0.5rem', background: '#f3f4f6', color: '#6b7280', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '0.25rem' }}>{kw.intent}</span>
                  )}
                  {kw.status && (
                    <span style={{ marginRight: '0.5rem', background: '#ede9fe', color: '#7c3aed', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '0.25rem' }}>{kw.status}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => alert('Edit keyword: ' + kw.text)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.25rem', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                  <button onClick={() => setClientKeywords(clientKeywords.filter(k => (k.id || k._id) !== (kw.id || kw._id)))} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '0.25rem', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Uploaded Keywords</h4>
        {keywords.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>No uploaded keywords.</div>
        ) : (
          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {keywords.map((kw) => (
              <div key={kw.id || kw._id} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', backgroundColor: selectedKeywords.includes(kw.id || kw._id) ? '#eff6ff' : 'white', cursor: 'pointer' }} onClick={() => toggleKeywordSelection(kw.id || kw._id)}>
                <input type="checkbox" checked={selectedKeywords.includes(kw.id || kw._id)} readOnly style={{ marginRight: '0.75rem' }} />
                <span style={{ fontWeight: '500' }}>{kw.text}</span>
                {kw.intent && (
                  <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.75rem' }}>{kw.intent}</span>
                )}
                {kw.status && (
                  <span style={{ marginLeft: '0.5rem', color: '#6366f1', fontSize: '0.75rem' }}>{kw.status}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 300px', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Assign to Team Member</label>
          <select value={allocationTarget} onChange={e => setAllocationTarget(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
            <option value="">Select team member...</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Role</label>
          <select value={allocationRole} onChange={e => setAllocationRole(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
            <option value="owner">Owner</option>
            <option value="employee">Employee</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setSelectedKeywords([...clientKeywords.map(kw => kw.id || kw._id), ...keywords.map(kw => kw.id || kw._id)])} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Select All</button>
        <button onClick={() => setSelectedKeywords([])} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Clear</button>
        <button onClick={allocateSelectedKeywords} disabled={!allocationTarget || selectedKeywords.length === 0 || processing} style={{ padding: '0.25rem 0.5rem', backgroundColor: (!allocationTarget || selectedKeywords.length === 0 || processing) ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: (!allocationTarget || selectedKeywords.length === 0 || processing) ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}>{processing ? 'Processing...' : 'Allocate'}</button>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>{selectedKeywords.length} keywords selected</div>
    </div>
  );

  const renderEditModal = () => {
    if (!isEditModalOpen || !editingKeyword) return null;

    return (
      <>
        {/* Modal Backdrop */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1001
          }}
          onClick={() => setIsEditModalOpen(false)}
        />
        
        {/* Modal Content */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '500px',
          zIndex: 1002,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Edit Keyword
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Keyword
              </label>
              <input
                type="text"
                value={editingKeyword.text}
                onChange={e => setEditingKeyword(prev => ({ ...prev!, text: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Intent
                </label>
                <select
                  value={editingKeyword.intent || 'informational'}
                  onChange={e => setEditingKeyword(prev => ({ ...prev!, intent: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="informational">Informational</option>
                  <option value="transactional">Transactional</option>
                  <option value="navigational">Navigational</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={editingKeyword.geo || ''}
                  onChange={e => setEditingKeyword(prev => ({ ...prev!, geo: e.target.value }))}
                  placeholder="Location"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Search Volume
                </label>
                <input
                  type="number"
                  value={editingKeyword.searchVolume || ''}
                  onChange={e => setEditingKeyword(prev => ({ ...prev!, searchVolume: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Difficulty (0-100)
                </label>
                <input
                  type="number"
                  value={editingKeyword.difficulty || ''}
                  onChange={e => setEditingKeyword(prev => ({ ...prev!, difficulty: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="0"
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsEditModalOpen(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={updateKeyword}
              disabled={!editingKeyword.text.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: editingKeyword.text.trim() ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: editingKeyword.text.trim() ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Update
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ 
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      padding: onClose ? '0' : '24px' // Only add padding if not used as modal
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: onClose ? '0.5rem' : '12px',
        padding: '2rem',
        maxWidth: onClose ? '60rem' : '1200px',
        width: onClose ? '90%' : '100%',
        margin: onClose ? '0' : '0 auto',
        maxHeight: onClose ? '80vh' : 'none',
        overflowY: onClose ? 'auto' : 'visible',
        ...(onClose ? {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        } : {
          border: '1px solid #E5E7EB'
        })
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Keyword Allocation System
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              style={{ 
                padding: '0.5rem', 
                backgroundColor: '#f3f4f6', 
                color: '#374151', 
                border: 'none', 
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          borderBottom: '1px solid #e5e7eb', 
          marginBottom: '2rem' 
        }}>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            {[
              { id: 'manage', label: 'Manage Keywords', icon: '📝' },
              { id: 'upload', label: 'Upload Keywords', icon: '📤' },
              { id: 'allocate', label: 'Allocate Keywords', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: view === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: view === tab.id ? '#3b82f6' : '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {view === 'manage' && renderManageView()}
        {view === 'upload' && renderUploadView()}
        {view === 'allocate' && renderAllocationView()}
        
        {/* Edit Modal */}
        {renderEditModal()}
      </div>
      {/* Modal backdrop only when used as modal */}
      {onClose && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} onClick={onClose} />
      )}
    </div>
  );
}