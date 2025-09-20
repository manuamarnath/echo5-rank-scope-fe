import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/components/auth/AuthContext';
import AIContentService from '../services/AIContentService';

interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  assignedTo?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
}

interface Brief {
  id: string;
  title: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  url: string;
  contentType: 'blog' | 'landing-page' | 'product-page' | 'guide';
  wordCount: number;
  tone: 'professional' | 'casual' | 'technical' | 'conversational';
  targetAudience: string;
  outline: string[];
  metaTitle: string;
  metaDescription: string;
  assignedTo: string;
  dueDate: string;
  status: 'draft' | 'review' | 'approved' | 'in-progress' | 'completed';
  createdAt: string;
  notes: string;
}

interface Competitor {
  url: string;
  title: string;
  wordCount: number;
  headings: string[];
  metaDescription: string;
}

export default function BriefGenerationInterface() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'templates'>('create');
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [clients, setClients] = useState<{_id: string, name: string}[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [newBrief, setNewBrief] = useState<Partial<Brief>>({
    title: '',
    targetKeyword: '',
    secondaryKeywords: [],
    url: '',
    contentType: 'blog',
    wordCount: 1500,
    tone: 'professional',
    targetAudience: '',
    outline: [],
    metaTitle: '',
    metaDescription: '',
    assignedTo: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
    setBriefs([]);
  }, []);

  useEffect(() => {
    if (selectedClientId) fetchClientKeywords(selectedClientId);
  }, [selectedClientId]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients/demo');
      if (response.ok) {
        const data = await response.json();
        setClients(data.map((c: any) => ({ _id: c._id, name: c.name })));
      }
    } catch (error) {
      setClients([]);
    }
  };

  const fetchClientKeywords = async (clientId: string) => {
    try {
      const response = await fetch(`/api/keywords?clientId=${clientId}`);
      if (response.ok) {
        const responseData = await response.json();
        // Handle both paginated response (with data property) and direct array
        const keywordsData = responseData.data || responseData;
        setKeywords(keywordsData.map((k: any) => ({
          id: k._id || k.id,
          keyword: k.text || k.keyword,
          searchVolume: k.volume || k.searchVolume || 0,
          difficulty: k.difficulty || 0,
          status: k.status || 'pending',
        })));
      } else {
        setKeywords([]);
      }
    } catch (error) {
      setKeywords([]);
    }
  };

  const generateFullContent = async () => {
    setIsGenerating(true);
    setGeneratedContent('');
    try {
      const prompt = `Generate a complete SEO-optimized ${newBrief.contentType} for the following brief:\n\n` +
        `Title: ${newBrief.title}\n` +
        `Target Keyword: ${newBrief.targetKeyword}\n` +
        `Secondary Keywords: ${(newBrief.secondaryKeywords || []).join(', ')}\n` +
        `URL: ${newBrief.url}\n` +
        `Word Count: ${newBrief.wordCount}\n` +
        `Tone: ${newBrief.tone}\n` +
        `Target Audience: ${newBrief.targetAudience}\n` +
        `Outline: ${(newBrief.outline || []).join(' | ')}\n` +
        `Meta Title: ${newBrief.metaTitle}\n` +
        `Meta Description: ${newBrief.metaDescription}\n` +
        `Notes: ${newBrief.notes}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an expert SEO content writer.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('OpenAI API error: ' + response.statusText);
      const data = await response.json();
      setGeneratedContent(data.choices[0].message.content);
    } catch (error) {
      setGeneratedContent('Error generating content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateKeywordSuggestions = async () => {
    if (!newBrief.targetKeyword) return;
    setIsGenerating(true);
    try {
      // Add keyword generation logic here
    } catch (error) {
      console.error('Error generating keywords:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIOutline = async () => {
    if (!newBrief.targetKeyword) return;
    setIsGenerating(true);
    try {
      // Add outline generation logic here
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBrief = async () => {
    try {
      const briefToSave = {
        ...newBrief,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'draft' as const
      };
      setBriefs(prev => [...prev, briefToSave as Brief]);
      
      // Reset form
      setNewBrief({
        title: '',
        targetKeyword: '',
        secondaryKeywords: [],
        url: '',
        contentType: 'blog',
        wordCount: 1500,
        tone: 'professional',
        targetAudience: '',
        outline: [],
        metaTitle: '',
        metaDescription: '',
        assignedTo: '',
        dueDate: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving brief:', error);
    }
  };

  const updateBriefStatus = (briefId: string, status: Brief['status']) => {
    setBriefs(prev => prev.map(brief => 
      brief.id === briefId ? { ...brief, status } : brief
    ));
  };

  const deleteBrief = (briefId: string) => {
    setBriefs(prev => prev.filter(brief => brief.id !== briefId));
  };

  const getStatusColor = (status: Brief['status']) => {
    switch (status) {
      case 'draft': return '#6B7280';
      case 'review': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'in-progress': return '#3B82F6';
      case 'completed': return '#059669';
      default: return '#6B7280';
    }
  };

  // --- Tab Renderers ---
  const renderCreateBrief = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Create Content Brief
      </h2>

      {/* Client and Keyword Selection */}
      <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
          Client & Keywords
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Select Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Select Target Keyword
            </label>
            <select
              value={newBrief.targetKeyword}
              onChange={(e) => setNewBrief(prev => ({ ...prev, targetKeyword: e.target.value }))}
              disabled={!selectedClientId || keywords.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                opacity: !selectedClientId || keywords.length === 0 ? 0.5 : 1
              }}
            >
              <option value="">Choose a keyword...</option>
              {keywords.map(keyword => (
                <option key={keyword.id} value={keyword.keyword}>
                  {keyword.keyword} (Vol: {keyword.searchVolume}, Diff: {keyword.difficulty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedClientId && keywords.length === 0 && (
          <div style={{ padding: '12px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px' }}>
            <p style={{ fontSize: '14px', color: '#92400E', margin: 0 }}>
              No keywords found for this client. Please add keywords in the Keywords section first.
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column - Brief Form */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Brief Title
            </label>
            <input
              type="text"
              value={newBrief.title}
              onChange={(e) => setNewBrief(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter brief title..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                Content Type
              </label>
              <select
                value={newBrief.contentType}
                onChange={(e) => setNewBrief(prev => ({ ...prev, contentType: e.target.value as Brief['contentType'] }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="blog">Blog Post</option>
                <option value="landing-page">Landing Page</option>
                <option value="product-page">Product Page</option>
                <option value="guide">Guide</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                Word Count
              </label>
              <input
                type="number"
                value={newBrief.wordCount}
                onChange={(e) => setNewBrief(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                Tone
              </label>
              <select
                value={newBrief.tone}
                onChange={(e) => setNewBrief(prev => ({ ...prev, tone: e.target.value as Brief['tone'] }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
                <option value="conversational">Conversational</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                Target URL
              </label>
              <input
                type="url"
                value={newBrief.url}
                onChange={(e) => setNewBrief(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/page"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Target Audience
            </label>
            <input
              type="text"
              value={newBrief.targetAudience}
              onChange={(e) => setNewBrief(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="Describe your target audience..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
            <button
              onClick={saveBrief}
              disabled={!newBrief.title || !newBrief.targetKeyword}
              style={{
                padding: '12px 24px',
                backgroundColor: newBrief.title && newBrief.targetKeyword ? '#10B981' : '#9CA3AF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: newBrief.title && newBrief.targetKeyword ? 'pointer' : 'not-allowed'
              }}
            >
              Create Brief
            </button>
            <button
              onClick={generateFullContent}
              disabled={isGenerating || !newBrief.title || !newBrief.targetKeyword}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isGenerating || !newBrief.title || !newBrief.targetKeyword ? 'not-allowed' : 'pointer',
                opacity: isGenerating || !newBrief.title || !newBrief.targetKeyword ? 0.6 : 1
              }}
            >
              {isGenerating ? 'Generating...' : '✨ Generate Content (OpenAI 3.5)'}
            </button>
          </div>

          {generatedContent && (
            <div style={{ marginTop: '32px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#1F2937' }}>Generated Content</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '15px', color: '#374151' }}>{generatedContent}</pre>
            </div>
          )}
        </div>

        {/* Right Column - AI Assistant */}
        <div>
          <div style={{ 
            backgroundColor: '#F9FAFB', 
            border: '1px solid #E5E7EB', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
              🤖 AI Content Assistant
            </h3>
            
            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={generateKeywordSuggestions}
                disabled={!newBrief.targetKeyword || isGenerating}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: newBrief.targetKeyword ? 'pointer' : 'not-allowed',
                  opacity: newBrief.targetKeyword ? 1 : 0.5
                }}
              >
                {isGenerating ? 'Generating...' : '🔍 Generate Keywords'}
              </button>
              
              <button
                onClick={generateAIOutline}
                disabled={!newBrief.targetKeyword || isGenerating}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: newBrief.targetKeyword ? 'pointer' : 'not-allowed',
                  opacity: newBrief.targetKeyword ? 1 : 0.5
                }}
              >
                {isGenerating ? 'Generating...' : '📝 Generate Outline'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderManageBriefs = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
          Manage Briefs
        </h2>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {briefs.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '12px', 
            padding: '40px', 
            textAlign: 'center' 
          }}>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>No briefs created yet. Create your first brief!</p>
          </div>
        ) : (
          briefs.map(brief => (
            <div key={brief.id} style={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1F2937' }}>
                    {brief.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>
                      <strong>Keyword:</strong> {brief.targetKeyword}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>
                      <strong>Type:</strong> {brief.contentType}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>
                      <strong>Words:</strong> {brief.wordCount}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: getStatusColor(brief.status),
                    color: 'white',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {brief.status}
                  </span>
                  <button
                    onClick={() => deleteBrief(brief.id)}
                    style={{
                      padding: '6px 8px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Brief Templates
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
            Blog Post Template
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            Standard blog post structure with SEO optimization
          </p>
          <button style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Use Template
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1F2937' }}>
            Brief Generation
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280' }}>
            Create AI-powered content briefs with competitor analysis and SEO optimization
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex' }}>
          {[
            { id: 'create', label: 'Create Brief', icon: '✏️' },
            { id: 'manage', label: 'Manage Briefs', icon: '📋' },
            { id: 'templates', label: 'Templates', icon: '📄' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'create' | 'manage' | 'templates')}
              style={{
                padding: '16px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid #3B82F6' : '3px solid transparent',
                color: activeTab === tab.id ? '#3B82F6' : '#6B7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'create' && renderCreateBrief()}
        {activeTab === 'manage' && renderManageBriefs()}
        {activeTab === 'templates' && renderTemplates()}
      </div>
    </div>
  );
}

