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
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiService] = useState(() => new AIContentService());
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
    loadKeywords();
    loadBriefs();
  }, []);

  const loadKeywords = async () => {
    // Mock keywords - replace with API call
    setKeywords([
      { id: '1', keyword: 'SEO optimization tools', searchVolume: 2400, difficulty: 65, status: 'assigned' },
      { id: '2', keyword: 'keyword research software', searchVolume: 1800, difficulty: 70, status: 'pending' },
      { id: '3', keyword: 'content marketing strategy', searchVolume: 3200, difficulty: 55, status: 'in-progress' },
      { id: '4', keyword: 'local SEO services', searchVolume: 1600, difficulty: 45, status: 'completed' },
    ]);
  };

  const loadBriefs = async () => {
    // Mock briefs - replace with API call
    setBriefs([
      {
        id: '1',
        title: 'Complete Guide to SEO Optimization Tools',
        targetKeyword: 'SEO optimization tools',
        secondaryKeywords: ['SEO software', 'keyword tools', 'ranking tools'],
        url: '/blog/seo-optimization-tools-guide',
        contentType: 'guide',
        wordCount: 2500,
        tone: 'professional',
        targetAudience: 'Marketing professionals and agencies',
        outline: [
          'Introduction to SEO Tools',
          'Keyword Research Tools',
          'Technical SEO Tools',
          'Content Optimization Tools',
          'Ranking Monitoring Tools',
          'Conclusion and Recommendations'
        ],
        metaTitle: 'Best SEO Optimization Tools 2024 - Complete Guide',
        metaDescription: 'Discover the top SEO optimization tools for 2024. Compare features, pricing, and benefits to boost your search rankings.',
        assignedTo: 'sarah@agency.com',
        dueDate: '2024-01-15',
        status: 'in-progress',
        createdAt: '2024-01-01',
        notes: 'Include screenshots of each tool interface'
      }
    ]);
  };

  const analyzeCompetitors = async (keyword: string) => {
    setIsGenerating(true);
    try {
      // Mock competitor analysis - replace with real SERP API
      const mockCompetitors: Competitor[] = [
        {
          url: 'https://competitor1.com/seo-tools',
          title: 'Top 10 SEO Tools for 2024',
          wordCount: 3200,
          headings: ['Introduction', 'Keyword Research', 'Technical SEO', 'Content Optimization'],
          metaDescription: 'Discover the best SEO tools to improve your rankings'
        },
        {
          url: 'https://competitor2.com/seo-software',
          title: 'Best SEO Software Review',
          wordCount: 2800,
          headings: ['Overview', 'Tool Comparison', 'Pricing Analysis', 'Recommendations'],
          metaDescription: 'Compare top SEO software solutions for your business'
        }
      ];
      setCompetitors(mockCompetitors);
    } catch (error) {
      console.error('Error analyzing competitors:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateKeywordSuggestions = async () => {
    if (!newBrief.targetKeyword) return;
    
    setIsGenerating(true);
    try {
      const response = await aiService.generateKeywordSuggestions({
        seedKeyword: newBrief.targetKeyword,
        industry: 'Digital Marketing', // Could be dynamic based on client
        intent: 'informational'
      });
      
      // Update keywords list with suggestions
      const suggestedKeywords = response.primaryKeywords.map((kw, index) => ({
        id: `suggested-${index}`,
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        difficulty: kw.difficulty,
        status: 'pending' as const
      }));
      
      setKeywords(prev => [...prev, ...suggestedKeywords]);
      
      // Auto-populate secondary keywords
      setNewBrief(prev => ({
        ...prev,
        secondaryKeywords: response.semanticKeywords.slice(0, 5)
      }));
    } catch (error) {
      console.error('Error generating keyword suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIOutline = async () => {
    if (!newBrief.targetKeyword) return;
    
    setIsGenerating(true);
    try {
      const response = await aiService.generateContentOutline({
        targetKeyword: newBrief.targetKeyword,
        contentType: newBrief.contentType || 'blog',
        wordCount: newBrief.wordCount || 1500,
        tone: newBrief.tone || 'professional',
        targetAudience: newBrief.targetAudience || '',
        competitors: competitors
      });
      
      setNewBrief(prev => ({
        ...prev,
        outline: response.outline,
        metaTitle: response.metaTitle,
        metaDescription: response.metaDescription,
        secondaryKeywords: response.suggestions.secondaryKeywords
      }));
    } catch (error) {
      console.error('Error generating AI outline:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBrief = async () => {
    if (!newBrief.title || !newBrief.targetKeyword) return;

    const brief: Brief = {
      id: Date.now().toString(),
      title: newBrief.title!,
      targetKeyword: newBrief.targetKeyword!,
      secondaryKeywords: newBrief.secondaryKeywords || [],
      url: newBrief.url || '',
      contentType: newBrief.contentType || 'blog',
      wordCount: newBrief.wordCount || 1500,
      tone: newBrief.tone || 'professional',
      targetAudience: newBrief.targetAudience || '',
      outline: newBrief.outline || [],
      metaTitle: newBrief.metaTitle || '',
      metaDescription: newBrief.metaDescription || '',
      assignedTo: newBrief.assignedTo || '',
      dueDate: newBrief.dueDate || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      notes: newBrief.notes || ''
    };

    setBriefs(prev => [brief, ...prev]);
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
    setCompetitors([]);
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

  const renderCreateBrief = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Create Content Brief
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column - Brief Details */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Brief Title *
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Target Keyword *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={newBrief.targetKeyword}
                onChange={(e) => setNewBrief(prev => ({ ...prev, targetKeyword: e.target.value }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select keyword...</option>
                {keywords.map(keyword => (
                  <option key={keyword.id} value={keyword.keyword}>
                    {keyword.keyword} ({keyword.searchVolume} vol)
                  </option>
                ))}
              </select>
              <button
                onClick={() => newBrief.targetKeyword && analyzeCompetitors(newBrief.targetKeyword)}
                disabled={!newBrief.targetKeyword || isGenerating}
                style={{
                  padding: '12px 16px',
                  backgroundColor: newBrief.targetKeyword ? '#3B82F6' : '#9CA3AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: newBrief.targetKeyword ? 'pointer' : 'not-allowed'
                }}
              >
                Analyze
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              URL Slug
            </label>
            <input
              type="text"
              value={newBrief.url}
              onChange={(e) => setNewBrief(prev => ({ ...prev, url: e.target.value }))}
              placeholder="/blog/your-article-slug"
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
                Due Date
              </label>
              <input
                type="date"
                value={newBrief.dueDate}
                onChange={(e) => setNewBrief(prev => ({ ...prev, dueDate: e.target.value }))}
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
              placeholder="e.g., Marketing professionals, Small business owners..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Secondary Keywords
            </label>
            <div style={{ border: '1px solid #D1D5DB', borderRadius: '8px', padding: '12px', minHeight: '80px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {newBrief.secondaryKeywords && newBrief.secondaryKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#EBF4FF',
                      color: '#3B82F6',
                      padding: '4px 8px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {keyword}
                    <button
                      onClick={() => {
                        setNewBrief(prev => ({
                          ...prev,
                          secondaryKeywords: prev.secondaryKeywords?.filter((_, i) => i !== index) || []
                        }));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0',
                        lineHeight: '1'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add secondary keywords (press Enter)"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#374151'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const keyword = input.value.trim();
                    if (keyword && !newBrief.secondaryKeywords?.includes(keyword)) {
                      setNewBrief(prev => ({
                        ...prev,
                        secondaryKeywords: [...(prev.secondaryKeywords || []), keyword]
                      }));
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Assign To
            </label>
            <select
              value={newBrief.assignedTo}
              onChange={(e) => setNewBrief(prev => ({ ...prev, assignedTo: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Select team member...</option>
              <option value="sarah@agency.com">Sarah (Content Writer)</option>
              <option value="mike@agency.com">Mike (SEO Specialist)</option>
              <option value="jenny@agency.com">Jenny (Content Manager)</option>
            </select>
          </div>
        </div>

        {/* Right Column - AI Assistant & Outline */}
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
            
            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Keyword Generator:</strong> Discover related keywords and semantic terms for your content.
              </p>
              <p>
                <strong>Outline Generator:</strong> AI will analyze your target keyword and create an optimized content structure with meta data.
              </p>
            </div>
          </div>

          {competitors.length > 0 && (
            <div style={{ 
              backgroundColor: '#FEF3C7', 
              border: '1px solid #F59E0B', 
              borderRadius: '12px', 
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#92400E' }}>
                Competitor Analysis
              </h4>
              {competitors.map((comp, index) => (
                <div key={index} style={{ marginBottom: '8px', fontSize: '12px', color: '#92400E' }}>
                  <strong>{comp.title}</strong> - {comp.wordCount} words
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Content Outline
            </label>
            <div style={{ border: '1px solid #D1D5DB', borderRadius: '8px', padding: '12px', minHeight: '200px' }}>
              {newBrief.outline && newBrief.outline.length > 0 ? (
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                  {newBrief.outline.map((item, index) => (
                    <li key={index} style={{ marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
                      {item}
                    </li>
                  ))}
                </ol>
              ) : (
                <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                  Use AI assistant to generate an outline or add items manually...
                </p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Meta Title
            </label>
            <input
              type="text"
              value={newBrief.metaTitle}
              onChange={(e) => setNewBrief(prev => ({ ...prev, metaTitle: e.target.value }))}
              placeholder="SEO-optimized title (60 chars max)"
              maxLength={60}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {newBrief.metaTitle?.length || 0}/60 characters
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Meta Description
            </label>
            <textarea
              value={newBrief.metaDescription}
              onChange={(e) => setNewBrief(prev => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="Compelling description for search results (160 chars max)"
              maxLength={160}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {newBrief.metaDescription?.length || 0}/160 characters
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Additional Notes
        </label>
        <textarea
          value={newBrief.notes}
          onChange={(e) => setNewBrief(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional requirements, style guidelines, or notes..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

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
          onClick={() => setNewBrief({
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
          })}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Clear Form
        </button>
      </div>
    </div>
  );

  const renderManageBriefs = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
          Manage Briefs
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={{
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="in-progress">In Progress</option>
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

      <div style={{ display: 'grid', gap: '16px' }}>
        {briefs.map(brief => (
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
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    <strong>Assigned:</strong> {brief.assignedTo || 'Unassigned'}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    <strong>Due:</strong> {brief.dueDate || 'No due date'}
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
                <select
                  value={brief.status}
                  onChange={(e) => updateBriefStatus(brief.id, e.target.value as Brief['status'])}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
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

            {brief.metaTitle && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', color: '#374151' }}>Meta Title:</strong>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0' }}>{brief.metaTitle}</p>
              </div>
            )}

            {brief.outline.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', color: '#374151' }}>Outline:</strong>
                <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {brief.outline.slice(0, 3).map((item, index) => (
                    <li key={index} style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                      {item}
                    </li>
                  ))}
                  {brief.outline.length > 3 && (
                    <li style={{ fontSize: '14px', color: '#9CA3AF' }}>
                      ... and {brief.outline.length - 3} more sections
                    </li>
                  )}
                </ol>
              </div>
            )}

            {brief.notes && (
              <div>
                <strong style={{ fontSize: '14px', color: '#374151' }}>Notes:</strong>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0' }}>{brief.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Brief Templates
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Blog Post Template */}
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
          <ul style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', paddingLeft: '20px' }}>
            <li>Introduction with hook</li>
            <li>Problem identification</li>
            <li>Solution overview</li>
            <li>Step-by-step guide</li>
            <li>Best practices</li>
            <li>Conclusion with CTA</li>
          </ul>
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

        {/* Product Page Template */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
            Product Page Template
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            Conversion-focused product page structure
          </p>
          <ul style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', paddingLeft: '20px' }}>
            <li>Product overview</li>
            <li>Key features & benefits</li>
            <li>Technical specifications</li>
            <li>Use cases & examples</li>
            <li>Pricing & packages</li>
            <li>FAQ & support</li>
          </ul>
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

        {/* Guide Template */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
            Comprehensive Guide Template
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            In-depth guide for complex topics
          </p>
          <ul style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', paddingLeft: '20px' }}>
            <li>Executive summary</li>
            <li>Background & context</li>
            <li>Methodology</li>
            <li>Detailed implementation</li>
            <li>Case studies</li>
            <li>Tools & resources</li>
            <li>Next steps</li>
          </ul>
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
            { id: 'templates', label: 'Templates', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '16px 24px',
                backgroundColor: activeTab === tab.id ? '#EBF4FF' : 'transparent',
                color: activeTab === tab.id ? '#3B82F6' : '#6B7280',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {tab.icon} {tab.label}
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