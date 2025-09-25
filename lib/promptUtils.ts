/**
 * Utility functions for replacing placeholders in the content generation prompt
 */

import { CONTENT_GENERATION_PROMPT } from './prompts/contentGeneration';

export interface ClientData {
  name: string;
  website: string;
  phone?: string;
  address: {
    full: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  services: string[];
  seedKeywords: Array<{ keyword: string; searchVolume?: number; difficulty?: number }>;
  contentData: {
    businessType: string;
    locationDescription?: string;
    serviceAreas: string[];
    primaryServiceArea: string;
    serviceAreaNeighborhoods?: string[]; // New: Specific neighborhoods
    serviceAreaZipCodes?: string[]; // New: ZIP codes covered
    serviceRadiusMiles?: number; // New: Service radius
    yearsInBusiness?: number; // New: Business experience
    localBusinessAssociations?: string[]; // New: Chamber, associations
    localBusinessExpertise?: string; // New: Local specialization
    communityInvolvement?: string; // New: Community engagement
    businessLatitude?: number; // New: GPS coordinates
    businessLongitude?: number; // New: GPS coordinates
    priceRange?: string; // New: Service pricing range
    paymentMethods?: string[]; // New: Accepted payments
    usps: string[];
    targetAudience: string;
    tone: 'professional' | 'casual' | 'technical' | 'conversational';
    seoGoals: string;
    primaryGeoKeyword: string;
    driveTimesDescription?: string;
    googleMapsEmbedURL?: string;
    socialLinks: string[];
    shortcodes: {
      contactForm?: string;
      reviews?: string;
      partners?: string;
    };
    businessHours?: string;
    businessDescription: string;
  };
  websiteStructure: string[];
  companyProfile?: {
    logoUrl?: string;
    website?: string;
    phone?: string;
    email?: string;
    socialProfiles?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
      youtube?: string;
    };
    businessHours?: Array<{
      day: string;
      open: string;
      close: string;
      closed?: boolean;
    }>;
    founded?: number;
    numberOfEmployees?: string;
    paymentMethods?: string[];
    priceRange?: string;
    businessType?: string;
  };
  websiteAnalysis?: {
    status: string;
    insights?: {
      content?: {
        topKeywords?: Array<{ word: string; count: number }>;
        contentThemes?: any;
        localSEOOpportunities?: string[];
      };
      seo?: {
        contentGaps?: string[];
        titleOptimization?: {
          issues?: string[];
        };
        headingStructure?: {
          issues?: string[];
        };
      };
      opportunities?: {
        missingPages?: string[];
        contentEnhancements?: string[];
        localOptimizations?: string[];
      };
    };
    recommendations?: Array<{
      category: string;
      priority: string;
      title: string;
      description: string;
      action: string;
    }>;
  };
}

export interface PageData {
  pageName: string;
  pageURL: string;
  service: string;
  selectedKeywords?: Array<{ keyword: string; searchVolume?: number; difficulty?: number }>;
  assignedKeywords?: string; // Comma-separated string of selected keywords
}

/**
 * Allocates keywords to a specific page based on page focus and keyword relevance
 */
export function allocateKeywords(keywords: Array<{ keyword: string }>, pageName: string): string[] {
  const pageNameLower = pageName.toLowerCase();
  const pageWords = pageNameLower.split(/\s+/);
  
  // Score keywords based on relevance to page
  const scoredKeywords = keywords.map(kw => {
    const keywordLower = kw.keyword.toLowerCase();
    let score = 0;
    
    // Exact page name match gets highest score
    if (keywordLower.includes(pageNameLower)) {
      score += 10;
    }
    
    // Check for individual word matches
    pageWords.forEach(word => {
      if (keywordLower.includes(word) && word.length > 2) {
        score += 3;
      }
    });
    
    // Service-related keywords
    if (pageNameLower.includes('service') && keywordLower.includes('service')) {
      score += 5;
    }
    
    // Product-related keywords
    if (pageNameLower.includes('product') && keywordLower.includes('product')) {
      score += 5;
    }
    
    // Common business terms
    const businessTerms = ['solution', 'consultation', 'expert', 'professional', 'quality'];
    businessTerms.forEach(term => {
      if (keywordLower.includes(term)) {
        score += 1;
      }
    });
    
    return { keyword: kw.keyword, score };
  });
  
  // Sort by score and return top 8 keywords
  return scoredKeywords
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(item => item.keyword);
}

/**
 * Replaces all placeholders in the prompt template with actual client data
 */
export function preparePrompt(clientData: ClientData, pageData: PageData): string {
  let prompt = CONTENT_GENERATION_PROMPT;
  
  // Basic business information
  prompt = prompt.replace(/\[Business Name\]/g, clientData.name);
  prompt = prompt.replace(/\[Website URL\]/g, clientData.website);
  prompt = prompt.replace(/\[Business Address\]/g, clientData.address.full);
  prompt = prompt.replace(/\[Business Street Address\]/g, clientData.address.street);
  prompt = prompt.replace(/\[Business Location City\]/g, clientData.address.city);
  prompt = prompt.replace(/\[Business State\]/g, clientData.address.state);
  prompt = prompt.replace(/\[Business Zip\]/g, clientData.address.zip);
  prompt = prompt.replace(/\[Business Phone\]/g, clientData.phone || '');
  
  // Content data
  const contentData = clientData.contentData;
  prompt = prompt.replace(/\[Business Type\]/g, contentData.businessType);
  prompt = prompt.replace(/\[Location Description\]/g, contentData.locationDescription || '');
  prompt = prompt.replace(/\[Service Areas\]/g, contentData.serviceAreas.join(', '));
  prompt = prompt.replace(/\[Primary Service Area\]/g, contentData.primaryServiceArea);
  prompt = prompt.replace(/\[Target Audience\]/g, contentData.targetAudience);
  prompt = prompt.replace(/\[Tone\]/g, contentData.tone);
  prompt = prompt.replace(/\[SEO Goals\]/g, contentData.seoGoals);
  prompt = prompt.replace(/\[Primary GEO Keyword\]/g, contentData.primaryGeoKeyword);
  prompt = prompt.replace(/\[Drive Times Description\]/g, contentData.driveTimesDescription || '');
  
  // Enhanced GEO data
  prompt = prompt.replace(/\[Service Area Neighborhoods\]/g, contentData.serviceAreaNeighborhoods?.join(', ') || contentData.primaryServiceArea);
  prompt = prompt.replace(/\[Service Area ZIP Codes\]/g, contentData.serviceAreaZipCodes?.join(', ') || '');
  prompt = prompt.replace(/\[Service Radius Miles\]/g, contentData.serviceRadiusMiles?.toString() || '25');
  prompt = prompt.replace(/\[Years In Business\]/g, contentData.yearsInBusiness?.toString() || '10+');
  prompt = prompt.replace(/\[Local Business Associations\]/g, contentData.localBusinessAssociations?.join(', ') || `${clientData.address.city} Chamber of Commerce`);
  prompt = prompt.replace(/\[Local Business Expertise\]/g, contentData.localBusinessExpertise || `Serving ${clientData.address.city} area`);
  prompt = prompt.replace(/\[Community Involvement\]/g, contentData.communityInvolvement || `Active in ${clientData.address.city} community`);
  prompt = prompt.replace(/\[Business Latitude\]/g, contentData.businessLatitude?.toString() || '0');
  prompt = prompt.replace(/\[Business Longitude\]/g, contentData.businessLongitude?.toString() || '0');
  prompt = prompt.replace(/\[Price Range\]/g, contentData.priceRange || '$$');
  prompt = prompt.replace(/\[Payment Methods\]/g, contentData.paymentMethods?.join(', ') || 'Cash, Check, Credit Cards');
  
  // Business hours and description
  prompt = prompt.replace(/\[Business Hours\]/g, contentData.businessHours || '');
  prompt = prompt.replace(/\[Business Description\]/g, contentData.businessDescription);
  
  // USPs (Unique Selling Points)
  for (let i = 0; i < 5; i++) {
    const uspKey = `[USP${i + 1}]`;
    const uspValue = contentData.usps[i] || '';
    prompt = prompt.replace(new RegExp(uspKey, 'g'), uspValue);
  }
  
  // Services and website structure
  prompt = prompt.replace(/\[Services\]/g, clientData.services.join(', '));
  prompt = prompt.replace(/\[Website Structure\]/g, clientData.websiteStructure.join(', '));
  
  // Keywords
  const keywordList = clientData.seedKeywords
    .map((kw, i) => `${i + 1}. ${kw.keyword}`)
    .join('\\n');
  prompt = prompt.replace(/\[Insert Client's 25\+ Keywords Here\]/g, keywordList);
  
  // Assigned keywords for this specific page
  let assignedKeywords;
  if (pageData.selectedKeywords && pageData.selectedKeywords.length > 0) {
    // Use manually selected keywords
    assignedKeywords = pageData.selectedKeywords.map(k => k.keyword);
  } else if (pageData.assignedKeywords) {
    // Use pre-assigned keywords string
    assignedKeywords = pageData.assignedKeywords.split(', ').filter(k => k.trim());
  } else {
    // Fall back to automatic allocation
    assignedKeywords = allocateKeywords(clientData.seedKeywords, pageData.pageName);
  }
  
  prompt = prompt.replace(/\[Assigned Keywords\]/g, assignedKeywords.join(', '));
  
  // Add strategic keyword placement information
  const primaryKeyword = assignedKeywords[0] || pageData.service;
  const secondaryKeywords = assignedKeywords.slice(1, 4).join(', ');
  const longTailKeywords = assignedKeywords.slice(4).join(', ');
  
  prompt = prompt.replace(/\[Primary Target Keyword\]/g, primaryKeyword);
  prompt = prompt.replace(/\[Secondary Keywords\]/g, secondaryKeywords || primaryKeyword);
  prompt = prompt.replace(/\[Long Tail Keywords\]/g, longTailKeywords || primaryKeyword);
  
  // Page-specific data
  prompt = prompt.replace(/\[Page Name\]/g, pageData.pageName);
  prompt = prompt.replace(/\[Page URL\]/g, pageData.pageURL);
  prompt = prompt.replace(/\[Service\]/g, pageData.service);
  
  // Schema arrays
  const areaServedArray = contentData.serviceAreas
    .map(area => `{"@type": "City", "name": "${area}"}`)
    .join(',');
  prompt = prompt.replace(/\[Area Served Array\]/g, `[${areaServedArray}]`);
  
  // Social links array for schema
  const socialLinksArray = contentData.socialLinks.length 
    ? contentData.socialLinks.map(link => `"${link}"`).join(',')
    : '';
  const mapsLink = `"https://www.google.com/maps/place/${encodeURIComponent(clientData.address.full)}"`;
  prompt = prompt.replace(/\[Social Links Array\]/g, `[${socialLinksArray}${socialLinksArray ? ',' : ''}${mapsLink}]`);
  
  // Google Maps and shortcodes
  prompt = prompt.replace(/\[Google Maps Embed URL\]/g, contentData.googleMapsEmbedURL || '');
  prompt = prompt.replace(/\[Contact Form Shortcode\]/g, contentData.shortcodes.contactForm || '[contact-form-7 id="123"]');
  prompt = prompt.replace(/\[Reviews Shortcode\]/g, contentData.shortcodes.reviews || '[reviews-shortcode]');
  prompt = prompt.replace(/\[Partner Logos Shortcode\]/g, contentData.shortcodes.partners || '[partner-logos]');
  
  // Current date and time for schema
  const now = new Date();
  prompt = prompt.replace(/\[Current Date\]/g, now.toISOString().split('T')[0]);
  prompt = prompt.replace(/\[Current Time\]/g, now.toTimeString().split(' ')[0]);
  
  // Encoded address for URLs
  prompt = prompt.replace(/\[Business Address Encoded\]/g, encodeURIComponent(clientData.address.full));
  
  // Company profile data for schema markup
  const companyProfile = clientData.companyProfile;
  if (companyProfile) {
    prompt = prompt.replace(/\[Company Logo URL\]/g, companyProfile.logoUrl || '');
    prompt = prompt.replace(/\[Company Website URL\]/g, companyProfile.website || clientData.website);
    prompt = prompt.replace(/\[Company Phone\]/g, companyProfile.phone || clientData.phone || '');
    prompt = prompt.replace(/\[Company Email\]/g, companyProfile.email || '');
    prompt = prompt.replace(/\[Company Founded Year\]/g, companyProfile.founded?.toString() || '');
    prompt = prompt.replace(/\[Company Employees\]/g, companyProfile.numberOfEmployees || '');
    prompt = prompt.replace(/\[Company Business Type\]/g, companyProfile.businessType || '');
    
    // Social media profiles
    const socialProfiles = companyProfile.socialProfiles;
    if (socialProfiles) {
      prompt = prompt.replace(/\[Facebook URL\]/g, socialProfiles.facebook || '');
      prompt = prompt.replace(/\[Twitter URL\]/g, socialProfiles.twitter || '');
      prompt = prompt.replace(/\[LinkedIn URL\]/g, socialProfiles.linkedin || '');
      prompt = prompt.replace(/\[Instagram URL\]/g, socialProfiles.instagram || '');
      prompt = prompt.replace(/\[YouTube URL\]/g, socialProfiles.youtube || '');
      
      // Create social media array for schema
      const socialMediaArray = [
        socialProfiles.facebook,
        socialProfiles.twitter,
        socialProfiles.linkedin,
        socialProfiles.instagram,
        socialProfiles.youtube
      ].filter(url => url && url.trim())
       .map(url => `"${url}"`)
       .join(',');
      
      prompt = prompt.replace(/\[Social Media Array\]/g, `[${socialMediaArray}]`);
    } else {
      // Default empty values if no social profiles
      prompt = prompt.replace(/\[Facebook URL\]/g, '');
      prompt = prompt.replace(/\[Twitter URL\]/g, '');
      prompt = prompt.replace(/\[LinkedIn URL\]/g, '');
      prompt = prompt.replace(/\[Instagram URL\]/g, '');
      prompt = prompt.replace(/\[YouTube URL\]/g, '');
      prompt = prompt.replace(/\[Social Media Array\]/g, '[]');
    }
  } else {
    // Default empty values if no company profile
    prompt = prompt.replace(/\[Company Logo URL\]/g, '');
    prompt = prompt.replace(/\[Company Website URL\]/g, clientData.website);
    prompt = prompt.replace(/\[Company Phone\]/g, clientData.phone || '');
    prompt = prompt.replace(/\[Company Email\]/g, '');
    prompt = prompt.replace(/\[Company Founded Year\]/g, '');
    prompt = prompt.replace(/\[Company Employees\]/g, '');
    prompt = prompt.replace(/\[Company Business Type\]/g, '');
    prompt = prompt.replace(/\[Facebook URL\]/g, '');
    prompt = prompt.replace(/\[Twitter URL\]/g, '');
    prompt = prompt.replace(/\[LinkedIn URL\]/g, '');
    prompt = prompt.replace(/\[Instagram URL\]/g, '');
    prompt = prompt.replace(/\[YouTube URL\]/g, '');
    prompt = prompt.replace(/\[Social Media Array\]/g, '[]');
  }
  
  // Website analysis insights integration
  if (clientData.websiteAnalysis && clientData.websiteAnalysis.status === 'completed' && clientData.websiteAnalysis.insights) {
    const analysis = clientData.websiteAnalysis.insights;
    
    // Add content gaps and opportunities
    const contentGaps = analysis.seo?.contentGaps || [];
    const missingPages = analysis.opportunities?.missingPages || [];
    const contentEnhancements = analysis.opportunities?.contentEnhancements || [];
    const localOptimizations = analysis.opportunities?.localOptimizations || [];
    
    // Create comprehensive analysis insights for AI
    const analysisInsights = [
      ...contentGaps.map(gap => `Content Gap: ${gap}`),
      ...missingPages.map(page => `Missing Page: ${page}`),
      ...contentEnhancements.map(enhancement => `Enhancement: ${enhancement}`),
      ...localOptimizations.map(opt => `Local SEO: ${opt}`)
    ].slice(0, 10); // Limit to top 10 insights
    
    prompt = prompt.replace(/\[Website Analysis Insights\]/g, analysisInsights.length > 0 ? 
      `\n\n**WEBSITE ANALYSIS INSIGHTS:**\nBased on analysis of ${clientData.website}, consider addressing these opportunities in your content:\n${analysisInsights.map(insight => `- ${insight}`).join('\n')}\n` : 
      ''
    );
    
    // Add competitor keywords if available
    const topKeywords = analysis.content?.topKeywords || [];
    const competitorKeywords = topKeywords.slice(0, 15).map(kw => kw.word).join(', ');
    prompt = prompt.replace(/\[Competitor Keywords\]/g, competitorKeywords ? 
      `Current website keywords: ${competitorKeywords}` : 
      ''
    );
    
    // Add SEO recommendations
    const seoRecommendations = clientData.websiteAnalysis.recommendations
      ?.filter(rec => rec.category === 'SEO' && rec.priority === 'high')
      .slice(0, 3)
      .map(rec => rec.action) || [];
    
    prompt = prompt.replace(/\[SEO Recommendations\]/g, seoRecommendations.length > 0 ? 
      `\n**HIGH-PRIORITY SEO IMPROVEMENTS:**\n${seoRecommendations.map(rec => `- ${rec}`).join('\n')}\n` : 
      ''
    );
    
  } else {
    // Default empty values if no analysis
    prompt = prompt.replace(/\[Website Analysis Insights\]/g, '');
    prompt = prompt.replace(/\[Competitor Keywords\]/g, '');
    prompt = prompt.replace(/\[SEO Recommendations\]/g, '');
  }
  
  return prompt;
}

/**
 * Validates that all required client data is present for content generation
 */
export function validateClientData(clientData: Partial<ClientData>): string[] {
  const errors: string[] = [];
  
  if (!clientData.name) errors.push('Business name is required');
  if (!clientData.website) errors.push('Website URL is required');
  if (!clientData.address?.full) errors.push('Business address is required');
  if (!clientData.address?.city) errors.push('Business city is required');
  if (!clientData.services?.length) errors.push('At least one service is required');
  if (!clientData.seedKeywords?.length) errors.push('Keywords are required');
  
  if (!clientData.contentData) {
    errors.push('Content data is required');
  } else {
    const cd = clientData.contentData;
    if (!cd.businessType) errors.push('Business type is required');
    if (!cd.primaryServiceArea) errors.push('Primary service area is required');
    if (!cd.targetAudience) errors.push('Target audience is required');
    if (!cd.businessDescription) errors.push('Business description is required');
    if (!cd.usps?.length) errors.push('At least one USP is required');
  }
  
  return errors;
}

/**
 * Creates a sample client data object for testing
 */
export function createSampleClientData(): ClientData {
  return {
    name: "Sample Business",
    website: "https://example.com",
    phone: "+1-555-123-4567",
    address: {
      full: "123 Main St, Anytown, ST 12345",
      street: "123 Main St",
      city: "Anytown",
      state: "ST",
      zip: "12345"
    },
    services: ["Service 1", "Service 2", "Consultation"],
    seedKeywords: [
      { keyword: "sample service anytown", searchVolume: 1000, difficulty: 30 },
      { keyword: "professional service st", searchVolume: 800, difficulty: 25 },
      { keyword: "quality service anytown", searchVolume: 600, difficulty: 35 }
    ],
    contentData: {
      businessType: "professional service provider",
      locationDescription: "conveniently located in downtown Anytown",
      serviceAreas: ["Anytown", "Nearby City", "Another City"],
      primaryServiceArea: "Anytown",
      serviceAreaNeighborhoods: ["Downtown Anytown", "Westside", "Eastside", "North District"],
      serviceAreaZipCodes: ["12345", "12346", "12347"],
      serviceRadiusMiles: 25,
      yearsInBusiness: 15,
      localBusinessAssociations: ["Anytown Chamber of Commerce", "ST Business Association"],
      localBusinessExpertise: "Specializing in professional services for Anytown residents",
      communityInvolvement: "Active sponsor of local community events and youth programs",
      businessLatitude: 40.7128,
      businessLongitude: -74.0060,
      priceRange: "$$",
      paymentMethods: ["Cash", "Check", "Credit Cards", "Online Payment"],
      usps: [
        "Professional expertise",
        "Local family-owned business", 
        "Free consultations",
        "Quality guaranteed",
        "Fast turnaround"
      ],
      targetAudience: "Local residents and businesses seeking quality professional services",
      tone: "professional",
      seoGoals: "Rank for local service keywords and establish authority in the area",
      primaryGeoKeyword: "anytown service provider",
      businessDescription: "Professional service provider in Anytown offering quality solutions",
      socialLinks: ["https://facebook.com/samplebusiness"],
      shortcodes: {
        contactForm: "[contact-form-7 id=\"123\"]",
        reviews: "[reviews id=\"456\"]",
        partners: "[partners-logos]"
      }
    },
    websiteStructure: ["Home", "Services", "About", "Contact"]
  };
}