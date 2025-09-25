/**
 * Comprehensive AI Content Generation Prompt Template
 * 
 * This template contains placeholders that will be replaced with actual client data
 * during content generation. All placeholders are in the format [Placeholder Name].
 */

export const CONTENT_GENERATION_PROMPT = `
As a senior content writer and SEO specialist for [Business Name], your task is to create engaging, plagiarism-free content for the website's inner pages (e.g., [Page Name Examples: Service 1, Service 2, Product 1]) at [Website URL]. The content must reflect the business's identity, optimize for SEO, AEO (Answer Engine Optimization for voice/AI searches), and GEO (local SEO for [Business Location City], serving [Primary Service Area] including [Service Area Neighborhoods]), and allocate a provided list of 25+ keywords to the most relevant pages. 

**CRITICAL AEO/GEO REQUIREMENTS:**
- **AEO Focus:** Create conversational FAQ sections optimized for voice search queries like "Hey Google, [question]"
- **GEO Focus:** Include specific neighborhoods, ZIP codes, service areas, and local business context throughout content
- **Local Authority:** Reference local landmarks, business districts, and community-specific information
- **Schema Markup:** Generate structured data for LocalBusiness and FAQ optimization

Below is everything you need to know about the business, the keywords, and how to structure the content.

### Business Background
[Business Name] is a [Business Type] located at [Business Address], a [Location Description]. We serve [Service Areas] with specific coverage in [Service Area Neighborhoods]. Our service area includes ZIP codes: [Service Area ZIP Codes]. We're proud members of [Local Business Associations] and have been serving the [Business Location City] community for [Years In Business] years.

Our unique selling points (USPs) are:
- [USP1]
- [USP2] 
- [USP3]
- [USP4]
- [USP5]

**Services:** [Services]
**Website Structure:** [Website Structure]
**Target Audience:** [Target Audience] 
**Brand Tone:** [Tone]
**SEO Goals:** [SEO Goals]
**Local Specialization:** [Local Business Expertise]
**Community Involvement:** [Community Involvement]

[Website Analysis Insights][SEO Recommendations]

### Current Website Analysis
[Competitor Keywords]

### Selected Keywords for This Page
**STRATEGIC KEYWORD IMPLEMENTATION:**
- **Primary Target Keyword:** [Primary Target Keyword] (Use in H1, first paragraph, and at least 3 times throughout content)
- **Secondary Keywords:** [Secondary Keywords] (Use in H2s, subheadings, and naturally in content)
- **Long-Tail Keywords:** [Long Tail Keywords] (Use in FAQ questions and detailed content sections)
- **Assigned Keywords for This Page:** [Assigned Keywords]

**KEYWORD PLACEMENT STRATEGY:**
1. **H1 Tag:** Must include [Primary Target Keyword] + location ([Primary Service Area])
2. **H2 Tags:** Incorporate [Secondary Keywords] naturally
3. **First Paragraph:** Include [Primary Target Keyword] within first 100 words
4. **FAQ Section:** Use [Long Tail Keywords] as natural questions
5. **Throughout Content:** Maintain 1-2% keyword density without keyword stuffing
6. **Meta Title:** Lead with [Primary Target Keyword]
7. **Meta Description:** Include [Primary Target Keyword] and location

### All Available Keywords
Below is the complete list of keywords available for this client. The selected keywords above have been specifically chosen for this page:
[Insert Client's 25+ Keywords Here]

**Content Optimization Requirements**:
- Natural keyword integration - avoid keyword stuffing
- Strategic placement in headings, opening paragraphs, and FAQ sections  
- Include [Primary GEO Keyword] and business address for local SEO consistency
- Use semantic variations and related terms for broader coverage

### Task: Create Inner Page Content
Create a 800-1000 word, plagiarism-free page for [Page Name] at [Page URL] in human-style writing (conversational, empathetic, engaging). The content must be optimized for WordPress/Elementor, with sections for easy widget use (Heading, Text Editor, Button, HTML, Shortcode). Follow this structure:

1. **Meta Information**:
   - **Title**: 60-70 characters, keyword-first (e.g., "[Primary Keyword] | [GEO USP]"), include [Primary Service Area] and [Business Location City].
   - **Description**: 150-160 characters, persuasive with CTA (e.g., "Discover [service] in [Primary Service Area] at our [Business Location City] showroom. Free consultation!").
   - **Keywords**: List 10 core keywords plus 3-5 page-specific keywords from the 25+ list.
   - **Canonical URL**: Use the page's slug (e.g., [Page URL]).
   - **Robots**: index, follow.
   - **Open Graph (OG) and Twitter Tags**:
     - OG Title: Match meta title.
     - OG Description: Match meta description.
     - OG URL: Match canonical URL.
     - OG Site Name: [Business Name].
     - OG Image: Use a unique image (e.g., [Website URL]/wp-content/uploads/2025/03/[Business Location City]-[page-name].jpg, 1200x630 pixels).
     - OG Image Width: 1200.
     - OG Image Height: 630.
     - OG Image Type: image/jpeg.
     - Twitter Card: summary_large_image.
     - Twitter Image: Match OG image.
     - Article Modified Time: Use deployment time (e.g., [Current Date]T[Current Time]+00:00).

2. **Hero Section**:
   - **H1**: Primary keyword with [Primary Service Area] and [Business Location City] (e.g., "[Service] [Primary Service Area] from [Business Location City]'s Trusted Store").
   - **Text**: 100-150 words introducing the service, USPs, and [Business Address]. End with a CTA.
   - **Button**: "Book a Free Consultation" (link to /contact/).
   - **Shortcode**: [Contact Form Shortcode] (sidebar, desktop only).

3. **Why Choose Us Section**:
   - **H2**: "Why Choose Our [Service] in [Primary Service Area]".
   - **Text**: 150-200 words with bullet points highlighting benefits (e.g., [USP1], [USP2]).
   - **Button**: "Explore [Service] Options" (link to [Page URL]).

4. **About Us Section**:
   - **H2**: "About [Business Name]".
   - **Text**: 150-200 words on business background, [Business Location City] showroom, services, and client focus.

5. **Enhanced Local Business Section (GEO Focus)**:
   - **H2**: "Visit Our [Business Location City] Location - Serving [Primary Service Area]".
   - **Location Details**: 150-200 words with complete address ([Business Address]), specific drive times from major areas ([Drive Times Description]), parking information, and local landmarks.
   - **Service Area Coverage**: "We proudly serve [Service Area Neighborhoods] and surrounding ZIP codes: [Service Area ZIP Codes]"
   - **Local Community Connection**: Mention [Local Business Associations], community involvement, and years serving the area
   - **Map Embed**: Use HTML widget with iframe:
     \`\`\`
     <iframe src="https://www.google.com/maps/embed?pb=[Google Maps Embed URL]" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
     \`\`\`
   - **Multiple CTAs**: 
     - "Schedule a Visit to Our [Business Location City] Location" (link to /contact/)
     - "Call [Business Phone] for [Primary Service Area] Service"
     - "Get Directions to Our [Business Location City] Office"

6. **Reviews Section**:
   - **H2**: "What Our [Primary Service Area] Clients Say".
   - **Text**: 50-100 words introducing client testimonials.
   - **Shortcode**: [Reviews Shortcode].
   - **Sample Reviews**: 4-5 testimonials (50-100 words each) targeting page-specific services.

7. **Enhanced FAQ Section (AEO Focus)**:
   - **H2**: "Frequently Asked Questions About [Service] in [Business Location City]".
   - **Voice Search Optimized Questions**: 6-8 H3 questions using natural, conversational language with 50-60 word answers.
   - **Required AEO Questions**:
     - What makes [Business Name] the best [service] company in [Primary Service Area]?
     - How much does [service] cost in [Business Location City] and surrounding areas?
     - How long does [service] take for [Primary Service Area] residents?
     - Do you serve [Service Area Neighborhoods] for [service]?
     - Can I visit your [Business Location City] location to discuss [service]?
     - What [service] options are popular in the [Primary Service Area] market?
     - How do I schedule [service] consultation in [Business Location City]?
     - What should [Primary Service Area] homeowners know about [service]?

8. **CTA Section**:
   - **H2**: "Start Your [Primary Service Area] [Service] Today".
   - **Text**: 100-150 words with strong CTA, mentioning [Business Location City] showroom.
   - **Shortcode**: [Contact Form Shortcode].
   - **Button**: "Get a Free Quote" (link to /contact/).

9. **Partner Logos**:
   - **H2**: "Our Trusted Partners".
   - **Shortcode**: [Partner Logos Shortcode].

10. **Enhanced Schema Markup (GEO & AEO)**:
    - Add to an Elementor HTML widget at the page bottom.
    - **Enhanced LocalBusiness Schema with Full GEO Data**:
      \`\`\`
      <script type="application/ld+json">
      {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "[Business Name]",
          "description": "[Business Description]",
          "url": "[Company Website URL]",
          "logo": "[Company Logo URL]",
          "telephone": "[Company Phone]",
          "email": "[Company Email]",
          "address": {
              "@type": "PostalAddress",
              "streetAddress": "[Business Street Address]",
              "addressLocality": "[Business Location City]",
              "addressRegion": "[Business State]",
              "postalCode": "[Business Zip]",
              "addressCountry": "US"
          },
          "geo": {
              "@type": "GeoCoordinates",
              "latitude": "[Business Latitude]",
              "longitude": "[Business Longitude]"
          },
          "areaServed": [
              "[Business Location City]",
              "[Primary Service Area]",
              "[Service Area Neighborhoods]"
          ],
          "serviceArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": "[Business Latitude]",
                  "longitude": "[Business Longitude]"
              },
              "geoRadius": "[Service Radius Miles] miles"
          },
          "openingHours": "[Business Hours]",
          "priceRange": "[Price Range]",
          "paymentAccepted": "[Payment Methods]",
          "image": "[Company Logo URL]",
          "foundingDate": "[Company Founded Year]",
          "numberOfEmployees": "[Company Employees]",
          "legalName": "[Business Name]",
          "sameAs": [Social Media Array]
      }
      </script>
      \`\`\`
    - **Enhanced FAQPage Schema for Voice Search**:
      \`\`\`
      <script type="application/ld+json">
      {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
              {
                  "@type": "Question",
                  "name": "What makes [Business Name] the best [service] company in [Primary Service Area]?",
                  "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "[Insert answer highlighting USPs, local expertise, and years serving the area]"
                  }
              },
              {
                  "@type": "Question",
                  "name": "Do you serve [Service Area Neighborhoods] for [service]?",
                  "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "[Insert answer about service area coverage including ZIP codes and drive times]"
                  }
              },
              {
                  "@type": "Question",
                  "name": "How much does [service] cost in [Business Location City] and surrounding areas?",
                  "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "[Insert answer with pricing ranges and factors affecting cost in local market]"
                  }
              }
          ]
      }
      </script>
      \`\`\`
    - **Service Schema**:
      \`\`\`
      <script type="application/ld+json">
      {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "[Service]",
          "provider": {
              "@type": "LocalBusiness",
              "name": "[Business Name]",
              "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "[Business Street Address]",
                  "addressLocality": "[Business Location City]",
                  "addressRegion": "[Business State]",
                  "postalCode": "[Business Zip]"
              }
          },
          "areaServed": [Area Served Array],
          "description": "Expert [service] in [Primary Service Area] from our [Business Location City] showroom."
      }
      </script>
      \`\`\`

11. **Image Alt Tags**:
    - Suggest 5-7 alt tags for images (e.g., "[Service] [Primary Service Area] from [Business Location City] showroom", <125 characters).
    - Use keywords, [Business Location City], and service-specific terms.
    - Compress images to <100KB (WebP if supported).

### Instructions for Content Writer
1. Replace Placeholders: Update [Page Name], [Page URL], [Service], and keywords with the actual client data.
2. Allocate Keywords: Map each of the 25+ keywords to the most relevant page based on page focus. Use 5-8 keywords per page, ensuring [Primary GEO Keyword] appears where relevant.
3. Verify Keyword Usage: After writing, use Ctrl+F to confirm all assigned keywords are in visible content (headings, text, FAQs). Document their locations in a text file.
4. Preserve External Links: Check the client's website for external links (e.g., social media, Google Business Profile). Include them in the footer and document in a text file.
5. Check Plagiarism: Use Copyscape or Grammarly to ensure 100% unique content.
6. Optimize for Elementor: Structure content for Heading, Text Editor, Button, HTML, and Shortcode widgets. Test shortcodes ([Contact Form Shortcode], [Reviews Shortcode], [Partner Logos Shortcode]).
7. Mobile and Speed: Ensure content is mobile-friendly (test with Google's Mobile-Friendly Tool) and images are optimized (<100KB) for >90/100 on PageSpeed Insights.
8. Submit Sitemap: After completion, submit sitemap.xml to Google Search Console (WordPress > Yoast SEO > Tools).
9. Documentation: Provide a text file listing:
   - Assigned keywords and their content locations.
   - External links (URL and location).
   - Any issues (e.g., shortcode errors).
10. Timeline: Complete each page within 5 business days. Contact the SEO specialist for clarification.

### Example for a Sample Page
To start, create content for the [Page Name] page at [Page URL]. Assign these keywords: [Assigned Keywords]. Follow the structure above, ensuring human-style writing, [Business Location City] focus, and [Primary Service Area] keywords. All schema markup will be populated with actual client data including company logo, contact information, and social media profiles.

**Prompt Example Output (for reference)**:
- **Meta Title**: [Primary Keyword] | [GEO USP]
- **Hero H1**: [Service] [Primary Service Area] from [Business Location City]'s Trusted Store
- **Text**: Transform your [Primary Service Area] home with [service] from our [Business Location City] showroom at [Business Address]. Enjoy [USP1]. Book a free consultation today!
- **FAQs**: "Why choose [service] in [Primary Service Area]?" with answers including keywords.

Now, create the content for [Page Name] at [Page URL] using the provided structure and keyword allocation logic. Ensure it's 800-1000 words, plagiarism-free, and optimized for SEO, AEO, and GEO.
`;

/**
 * All placeholders used in the prompt template
 */
export const PROMPT_PLACEHOLDERS = [
  'Business Name',
  'Website URL', 
  'Business Address',
  'Business Street Address',
  'Business Location City',
  'Business State',
  'Business Zip',
  'Business Phone',
  'Business Hours',
  'Business Description',
  'Business Type',
  'Location Description',
  'Service Areas',
  'Area Served Array',
  'Primary Service Area',
  'Service Area Neighborhoods', // New: Specific neighborhoods served
  'Service Area ZIP Codes', // New: ZIP codes covered
  'Service Radius Miles', // New: Service radius
  'Years In Business', // New: Business experience
  'Local Business Associations', // New: Chamber of Commerce, etc.
  'Local Business Expertise', // New: Local specialization
  'Community Involvement', // New: Local community engagement
  'Business Latitude', // New: GPS coordinates
  'Business Longitude', // New: GPS coordinates
  'Price Range', // New: Service pricing range
  'Payment Methods', // New: Accepted payments
  'USP1', 'USP2', 'USP3', 'USP4', 'USP5',
  'Services',
  'Website Structure',
  'Target Audience', 
  'Tone',
  'SEO Goals',
  'Insert Client\'s 25+ Keywords Here',
  'Primary GEO Keyword',
  'Page Name',
  'Page URL',
  'Service',
  'Assigned Keywords',
  'Google Maps Embed URL',
  'Social Links Array',
  'Contact Form Shortcode',
  'Reviews Shortcode', 
  'Partner Logos Shortcode',
  'Current Date',
  'Current Time',
  'Drive Times Description'
] as const;

export type PlaceholderKey = typeof PROMPT_PLACEHOLDERS[number];