import React from 'react';
import { Keyword } from '../src/components/keywords/interfaces';

interface Brief {
  title?: string;
  targetKeyword?: string;
  contentType?: 'blog' | 'page' | 'product';
  tone?: string;
  targetAudience?: string;
}

interface CreateBriefFormProps {
  newBrief: Partial<Brief>;
  setNewBrief: React.Dispatch<React.SetStateAction<Partial<Brief>>>;
  keywords: Keyword[];
  selectedClientId: string | null;
  isGenerating: boolean;
  generateContent: () => void;
  generateKeywordSuggestions: () => void;
}

const CreateBriefForm: React.FC<CreateBriefFormProps> = ({
  newBrief,
  setNewBrief,
  keywords,
  selectedClientId,
  isGenerating,
  generateContent,
  generateKeywordSuggestions
}) => {
  return (
    <div>
      {/* Title Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Title
        </label>
        <input
          type="text"
          value={newBrief.title || ''}
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

      {/* Target Keyword Select */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Target Keyword
        </label>
        {selectedClientId ? (
          <select
            value={newBrief.targetKeyword || ''}
            onChange={(e) => setNewBrief(prev => ({ ...prev, targetKeyword: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">Select a keyword...</option>
            {keywords.map((keyword) => (
              <option key={keyword._id || keyword.id} value={keyword.text}>
                {keyword.text} (Vol: {keyword.searchVolume || keyword.volume}, Diff: {keyword.difficulty})
              </option>
            ))}
          </select>
        ) : (
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Please select a client first.</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column - Brief Form (Content Type, Tone, Audience) */}
        <div>
          {/* Content Type Select */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Content Type
            </label>
            <select
              value={newBrief.contentType || ''}
              onChange={(e) => setNewBrief(prev => ({ ...prev, contentType: e.target.value as Brief['contentType'] }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Select content type...</option>
              <option value="blog">Blog Post</option>
              <option value="page">Landing Page</option>
              <option value="product">Product Description</option>
              {/* Add more options as needed */}
            </select>
          </div>

          {/* Tone Select */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Tone
            </label>
            <select
              value={newBrief.tone || ''}
              onChange={(e) => setNewBrief(prev => ({ ...prev, tone: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Select tone...</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="authoritative">Authoritative</option>
              {/* Add more options as needed */}
            </select>
          </div>

          {/* Target Audience Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Target Audience
            </label>
            <input
              type="text"
              value={newBrief.targetAudience || ''}
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
        </div>

        {/* Right Column - Additional Options */}
        <div>
          {/* Generate Keyword Suggestions Button */}
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
              marginBottom: '12px',
              cursor: (!newBrief.targetKeyword || isGenerating) ? 'not-allowed' : 'pointer',
              opacity: (!newBrief.targetKeyword || isGenerating) ? 0.6 : 1
            }}
          >
            Generate Keyword Suggestions
          </button>
        </div>
      </div>

      {/* Generate Content Button */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={generateContent}
          disabled={isGenerating || !newBrief.title || !newBrief.targetKeyword}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: (isGenerating || !newBrief.title || !newBrief.targetKeyword) ? 'not-allowed' : 'pointer',
            opacity: (isGenerating || !newBrief.title || !newBrief.targetKeyword) ? 0.6 : 1
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Content ✨'}
        </button>
      </div>
    </div>
  );
};

export default CreateBriefForm;