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
}

export interface PageData {
  pageName: string;
  pageURL: string;
  service: string;
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
  const assignedKeywords = allocateKeywords(clientData.seedKeywords, pageData.pageName);
  prompt = prompt.replace(/\[Assigned Keywords\]/g, assignedKeywords.join(', '));
  
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