// AI Content Assistant Service
// This service handles AI-powered content generation using OpenAI API

interface ContentOutlineRequest {
  targetKeyword: string;
  contentType: 'blog' | 'landing-page' | 'product-page' | 'guide';
  wordCount: number;
  tone: 'professional' | 'casual' | 'technical' | 'conversational';
  targetAudience: string;
  competitors?: Array<{
    title: string;
    headings: string[];
    wordCount: number;
  }>;
}

interface ContentOutlineResponse {
  outline: string[];
  metaTitle: string;
  metaDescription: string;
  suggestions: {
    secondaryKeywords: string[];
    internalLinks: string[];
    externalLinks: string[];
  };
}

interface KeywordSuggestionsRequest {
  seedKeyword: string;
  industry: string;
  intent: 'informational' | 'commercial' | 'navigational' | 'transactional';
}

interface KeywordSuggestionsResponse {
  primaryKeywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    intent: string;
  }>;
  longTailKeywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
  }>;
  semanticKeywords: string[];
}

class AIContentService {
  private baseUrl: string = 'http://localhost:5001';

  constructor() {
    // No API key needed since we're using the backend
  }

  async generateContentOutline(request: ContentOutlineRequest): Promise<ContentOutlineResponse> {
    try {
      const prompt = this.buildContentOutlinePrompt(request);
      
      const response = await fetch(`${this.baseUrl}/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Content generation API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseContentOutlineResponse(data.content);
    } catch (error) {
      console.error('Error generating content outline:', error);
      // Fallback to mock data if API fails
      return this.getMockContentOutline(request);
    }
  }

  async generateKeywordSuggestions(request: KeywordSuggestionsRequest): Promise<KeywordSuggestionsResponse> {
    try {
      const prompt = this.buildKeywordSuggestionsPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Content generation API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseKeywordSuggestionsResponse(data.content);
    } catch (error) {
      console.error('Error generating keyword suggestions:', error);
      return this.getMockKeywordSuggestions(request);
    }
  }

  async optimizeMetaData(content: {
    title: string;
    keyword: string;
    outline: string[];
  }): Promise<{ title: string; description: string; }> {
    try {
      const prompt = `
        Optimize SEO meta data for:
        Target Keyword: ${content.keyword}
        Content Title: ${content.title}
        Content Outline: ${content.outline.join(', ')}
        
        Generate:
        1. SEO-optimized meta title (under 60 characters, include target keyword)
        2. Compelling meta description (under 160 characters, include target keyword, call-to-action)
        
        Format response as JSON:
        {
          "title": "...",
          "description": "..."
        }
      `;

      const response = await fetch(`${this.baseUrl}/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Content generation API error: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.content);
    } catch (error) {
      console.error('Error optimizing meta data:', error);
      return this.getMockMetaData(content);
    }
  }

  private buildContentOutlinePrompt(request: ContentOutlineRequest): string {
    const competitorInfo = request.competitors && request.competitors.length > 0
      ? `\n\nCompetitor Analysis:\n${request.competitors.map(comp => 
          `- ${comp.title} (${comp.wordCount} words): ${comp.headings.join(', ')}`
        ).join('\n')}`
      : '';

    return `
      Create a comprehensive content outline for:
      
      Target Keyword: ${request.targetKeyword}
      Content Type: ${request.contentType}
      Target Word Count: ${request.wordCount}
      Tone: ${request.tone}
      Target Audience: ${request.targetAudience}${competitorInfo}
      
      Generate:
      1. Detailed content outline (8-12 sections)
      2. SEO-optimized meta title (under 60 chars)
      3. Compelling meta description (under 160 chars)
      4. 5-8 secondary keywords
      5. Suggested internal/external link opportunities
      
      Format as JSON:
      {
        "outline": ["section1", "section2", ...],
        "metaTitle": "...",
        "metaDescription": "...",
        "suggestions": {
          "secondaryKeywords": ["keyword1", "keyword2", ...],
          "internalLinks": ["link1", "link2", ...],
          "externalLinks": ["link1", "link2", ...]
        }
      }
    `;
  }

  private buildKeywordSuggestionsPrompt(request: KeywordSuggestionsRequest): string {
    return `
      Generate keyword suggestions for:
      
      Seed Keyword: ${request.seedKeyword}
      Industry: ${request.industry}
      Search Intent: ${request.intent}
      
      Provide:
      1. 10 primary keywords (high volume, moderate difficulty)
      2. 15 long-tail keywords (lower volume, easier to rank)
      3. 10 semantic/LSI keywords for content context
      
      Format as JSON with estimated search volumes and difficulty scores (1-100).
    `;
  }

  private parseContentOutlineResponse(response: string): ContentOutlineResponse {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback parsing if JSON is malformed
      console.error('Error parsing AI response:', error);
      return this.getMockContentOutline({} as ContentOutlineRequest);
    }
  }

  private parseKeywordSuggestionsResponse(response: string): KeywordSuggestionsResponse {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getMockKeywordSuggestions({} as KeywordSuggestionsRequest);
    }
  }

  private getMockContentOutline(request: ContentOutlineRequest): ContentOutlineResponse {
    const keyword = request.targetKeyword || 'SEO optimization';
    return {
      outline: [
        `Introduction to ${keyword}`,
        'Understanding the Fundamentals',
        'Key Benefits and Advantages',
        'Step-by-Step Implementation Guide',
        'Best Practices and Expert Tips',
        'Common Mistakes to Avoid',
        'Tools and Resources',
        'Case Studies and Real Examples',
        'Advanced Strategies',
        'Future Trends and Considerations',
        'Conclusion and Next Steps'
      ],
      metaTitle: `${keyword} - Complete Guide 2024 | Expert Tips & Strategies`,
      metaDescription: `Master ${keyword} with our comprehensive guide. Learn best practices, avoid common mistakes, and get expert tips for success. Start optimizing today!`,
      suggestions: {
        secondaryKeywords: [
          `${keyword} tools`,
          `${keyword} strategy`,
          `${keyword} best practices`,
          `${keyword} guide`,
          `how to ${keyword.toLowerCase()}`
        ],
        internalLinks: [
          '/blog/seo-fundamentals',
          '/tools/keyword-research',
          '/guides/content-optimization',
          '/resources/seo-checklist'
        ],
        externalLinks: [
          'Google Search Console',
          'Google Analytics',
          'Search Engine Journal',
          'Moz Blog'
        ]
      }
    };
  }

  private getMockKeywordSuggestions(request: KeywordSuggestionsRequest): KeywordSuggestionsResponse {
    const seed = request.seedKeyword || 'SEO';
    return {
      primaryKeywords: [
        { keyword: `${seed} optimization`, searchVolume: 2400, difficulty: 65, intent: 'informational' },
        { keyword: `${seed} tools`, searchVolume: 1800, difficulty: 70, intent: 'commercial' },
        { keyword: `${seed} strategy`, searchVolume: 1600, difficulty: 60, intent: 'informational' },
        { keyword: `best ${seed} practices`, searchVolume: 1200, difficulty: 55, intent: 'informational' },
        { keyword: `${seed} checklist`, searchVolume: 980, difficulty: 45, intent: 'informational' }
      ],
      longTailKeywords: [
        { keyword: `how to improve ${seed}`, searchVolume: 720, difficulty: 35 },
        { keyword: `${seed} for beginners`, searchVolume: 650, difficulty: 30 },
        { keyword: `${seed} step by step guide`, searchVolume: 580, difficulty: 40 },
        { keyword: `${seed} tips and tricks`, searchVolume: 520, difficulty: 35 },
        { keyword: `${seed} common mistakes`, searchVolume: 480, difficulty: 30 }
      ],
      semanticKeywords: [
        'search engine optimization',
        'organic traffic',
        'SERP rankings',
        'keyword research',
        'content optimization',
        'technical SEO',
        'link building',
        'on-page optimization',
        'search visibility',
        'website ranking'
      ]
    };
  }

  private getMockMetaData(content: { title: string; keyword: string; }): { title: string; description: string; } {
    return {
      title: `${content.keyword} - ${content.title} | Expert Guide 2024`,
      description: `Learn ${content.keyword} with our comprehensive guide. Expert tips, proven strategies, and actionable insights to boost your results. Get started today!`
    };
  }
}

export default AIContentService;
export type {
  ContentOutlineRequest,
  ContentOutlineResponse,
  KeywordSuggestionsRequest,
  KeywordSuggestionsResponse
};