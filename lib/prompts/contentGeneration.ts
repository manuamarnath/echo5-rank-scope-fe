/**
 * Comprehensive AI Content Generation Prompt Template
 * 
 * This template contains placeholders that will be replaced with actual client data
 * during content generation. All placeholders are in the format [Placeholder Name].
 */

export const CONTENT_GENERATION_PROMPT = `
As a senior content writer and SEO specialist for [Business Name], your task is to create engaging, plagiarism-free content for the website's inner pages (e.g., [Page Name Examples: Service 1, Service 2, Product 1]) at [Website URL]. The content must reflect the business's identity, optimize for SEO, AEO (Answer Engine Optimization for voice/AI searches), and GEO (local SEO for [Business Location City], serving [Primary Service Area]), and allocate a provided list of 25+ keywords to the most relevant pages. Below is everything you need to know about the business, the keywords, and how to structure the content.

### Business Background
[Business Name] is a [Business Type] located at [Business Address], a [Location Description]. We serve [Service Areas]. Our unique selling points (USPs) are:
- [USP1]
- [USP2]
- [USP3]
- [USP4]
- [USP5]
- [Services]
- [Website Structure]
- [Target Audience]
- [Tone]
- [SEO Goals]

### Keywords to Allocate
Below is the list of 25+ keywords to be distributed across the website's pages. Allocate each keyword to the most relevant page based on its service focus (e.g., keywords containing "service" to Service page). Ensure all keywords appear visibly in content (headings, text, FAQs) for SEO and AEO, not just meta tags. Here's the full list:
[Insert Client's 25+ Keywords Here]

**Keyword Allocation Logic**:
- Assign keywords based on page focus (e.g., keywords containing "service" to Service page).
- Ensure 5-8 relevant keywords per page, integrated naturally in headings, text, and FAQs.
- Include [Primary GEO Keyword] and the address ([Business Address]) on every page for GEO consistency.
- Use secondary keywords where relevant to support broader SEO.

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

5. **Showroom Section (GEO Focus)**:
   - **H2**: "Visit Our Large [Business Location City] Showroom".
   - **Text**: 100-150 words with address ([Business Address]), drive times ([Drive Times Description]), and invitation to see samples.
   - **Map Embed**: Use HTML widget with iframe:
     \`\`\`
     <iframe src="https://www.google.com/maps/embed?pb=[Google Maps Embed URL]" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
     \`\`\`
   - **Button**: "Schedule a Showroom Visit" (link to /contact/).

6. **Reviews Section**:
   - **H2**: "What Our [Primary Service Area] Clients Say".
   - **Text**: 50-100 words introducing client testimonials.
   - **Shortcode**: [Reviews Shortcode].
   - **Sample Reviews**: 4-5 testimonials (50-100 words each) targeting page-specific services.

7. **FAQ Section (AEO Focus)**:
   - **H2**: "Frequently Asked Questions About [Service]".
   - **Questions**: 5-6 H3 questions with 50-60 word answers, using page-specific keywords.
   - **Examples**:
     - Why choose [service] in [Primary Service Area]?
     - How much does [service] cost in [Primary Service Area]?
     - How long does [service] take in [Primary Service Area]?
     - Can I see samples at your [Business Location City] showroom?
     - Do you offer [specific service feature] for [service]?

8. **CTA Section**:
   - **H2**: "Start Your [Primary Service Area] [Service] Today".
   - **Text**: 100-150 words with strong CTA, mentioning [Business Location City] showroom.
   - **Shortcode**: [Contact Form Shortcode].
   - **Button**: "Get a Free Quote" (link to /contact/).

9. **Partner Logos**:
   - **H2**: "Our Trusted Partners".
   - **Shortcode**: [Partner Logos Shortcode].

10. **Schema Markup (GEO & AEO)**:
    - Add to an Elementor HTML widget at the page bottom.
    - **LocalBusiness Schema**:
      \`\`\`
      <script type="application/ld+json">
      {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "[Business Name]",
          "address": {
              "@type": "PostalAddress",
              "streetAddress": "[Business Street Address]",
              "addressLocality": "[Business Location City]",
              "addressRegion": "[Business State]",
              "postalCode": "[Business Zip]",
              "addressCountry": "US"
          },
          "description": "[Business Description]",
          "url": "[Website URL]/[page-slug]/",
          "telephone": "[Business Phone]",
          "openingHours": "[Business Hours]",
          "areaServed": [Area Served Array],
          "image": "[Website URL]/wp-content/uploads/2025/03/[Business Location City]-[page-name].jpg",
          "sameAs": [Social Links Array]
      }
      </script>
      \`\`\`
    - **FAQPage Schema**:
      \`\`\`
      <script type="application/ld+json">
      {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
              {
                  "@type": "Question",
                  "name": "[Insert H3 Question 1]",
                  "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "[Insert 50-60 word Answer 1 with keywords]"
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
To start, create content for the [Page Name] page at [Page URL]. Assign these keywords: [Assigned Keywords]. Follow the structure above, ensuring human-style writing, [Business Location City] focus, and [Primary Service Area] keywords. Replace schema placeholders (phone, social URLs) with actual values or remove if unavailable.

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