import React, { useState, useEffect } from 'react';

interface RankingData {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  change: number;
  searchVolume: number;
  url: string;
  client: string;
  lastUpdated: string;
}

interface TrafficData {
  date: string;
  organicTraffic: number;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
}

interface ContentMetrics {
  pageUrl: string;
  title: string;
  publishDate: string;
  organicTraffic: number;
  backlinks: number;
  shareCount: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  client: string;
}

interface ClientROI {
  clientId: string;
  clientName: string;
  monthlySpend: number;
  organicTrafficIncrease: number;
  leadGeneration: number;
  estimatedValue: number;
  roi: number;
  keywordsRanking: number;
  contentPieces: number;
}

export default function ReportingAnalytics() {
  const [activeTab, setActiveTab] = useState<'rankings' | 'traffic' | 'content' | 'roi' | 'reports'>('rankings');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });
  const [selectedClient, setSelectedClient] = useState('all');
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics[]>([]);
  const [roiData, setRoiData] = useState<ClientROI[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedClient]);

  const loadAnalyticsData = async () => {
    // Mock data - replace with real API calls
    setRankingData([
      {
        keyword: 'local seo services',
        currentPosition: 3,
        previousPosition: 5,
        change: 2,
        searchVolume: 1200,
        url: '/services/local-seo',
        client: 'Local Restaurant Chain',
        lastUpdated: '2024-01-15'
      },
      {
        keyword: 'seo optimization tools',
        currentPosition: 7,
        previousPosition: 12,
        change: 5,
        searchVolume: 2400,
        url: '/blog/seo-tools-guide',
        client: 'SaaS Startup',
        lastUpdated: '2024-01-15'
      },
      {
        keyword: 'content marketing strategy',
        currentPosition: 15,
        previousPosition: 8,
        change: -7,
        searchVolume: 1800,
        url: '/blog/content-strategy',
        client: 'E-commerce Store',
        lastUpdated: '2024-01-15'
      }
    ]);

    setTrafficData([
      { date: '2024-01-01', organicTraffic: 1250, clicks: 980, impressions: 15400, ctr: 6.36, avgPosition: 8.2 },
      { date: '2024-01-02', organicTraffic: 1380, clicks: 1120, impressions: 16200, ctr: 6.91, avgPosition: 7.8 },
      { date: '2024-01-03', organicTraffic: 1420, clicks: 1180, impressions: 16800, ctr: 7.02, avgPosition: 7.5 },
      { date: '2024-01-04', organicTraffic: 1600, clicks: 1350, impressions: 18200, ctr: 7.42, avgPosition: 7.1 },
      { date: '2024-01-05', organicTraffic: 1750, clicks: 1480, impressions: 19500, ctr: 7.59, avgPosition: 6.8 }
    ]);

    setContentMetrics([
      {
        pageUrl: '/blog/local-seo-guide',
        title: 'Complete Guide to Local SEO in 2024',
        publishDate: '2024-01-10',
        organicTraffic: 2400,
        backlinks: 18,
        shareCount: 156,
        avgTimeOnPage: 245,
        bounceRate: 35,
        conversionRate: 3.2,
        client: 'Local Restaurant Chain'
      },
      {
        pageUrl: '/blog/seo-tools-comparison',
        title: 'Best SEO Tools 2024: Complete Comparison',
        publishDate: '2024-01-05',
        organicTraffic: 3200,
        backlinks: 24,
        shareCount: 89,
        avgTimeOnPage: 312,
        bounceRate: 28,
        conversionRate: 4.1,
        client: 'SaaS Startup'
      }
    ]);

    setRoiData([
      {
        clientId: 'client-1',
        clientName: 'Local Restaurant Chain',
        monthlySpend: 3500,
        organicTrafficIncrease: 145,
        leadGeneration: 28,
        estimatedValue: 15400,
        roi: 340,
        keywordsRanking: 45,
        contentPieces: 8
      },
      {
        clientId: 'client-2',
        clientName: 'SaaS Startup',
        monthlySpend: 5000,
        organicTrafficIncrease: 210,
        leadGeneration: 52,
        estimatedValue: 28900,
        roi: 478,
        keywordsRanking: 67,
        contentPieces: 12
      }
    ]);
  };

  const renderRankingsTab = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1F2937' }}>
          Keyword Rankings
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Keywords</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>247</p>
            <span style={{ fontSize: '12px', color: '#10B981' }}>+12 this month</span>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Top 10 Rankings</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>34</p>
            <span style={{ fontSize: '12px', color: '#10B981' }}>+5 this month</span>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Avg Position</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>8.2</p>
            <span style={{ fontSize: '12px', color: '#10B981' }}>-1.4 improvement</span>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Position Changes</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>+18</p>
            <span style={{ fontSize: '12px', color: '#10B981' }}>Net improvement</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Keyword
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Current Position
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Change
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Search Volume
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                URL
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Client
              </th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
                  {item.keyword}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: item.currentPosition <= 3 ? '#10B981' : item.currentPosition <= 10 ? '#F59E0B' : '#6B7280'
                  }}>
                    #{item.currentPosition}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: item.change > 0 ? '#10B981' : item.change < 0 ? '#EF4444' : '#6B7280'
                  }}>
                    {item.change > 0 ? '↗️' : item.change < 0 ? '↘️' : '→'}
                    {Math.abs(item.change)}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                  {item.searchVolume.toLocaleString()}
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#3B82F6' }}>
                  {item.url}
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#6B7280' }}>
                  {item.client}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTrafficTab = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Organic Traffic Analytics
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Organic Traffic</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>47,280</p>
          <span style={{ fontSize: '12px', color: '#10B981' }}>+23% vs last month</span>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Average CTR</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>7.2%</p>
          <span style={{ fontSize: '12px', color: '#10B981' }}>+0.8% improvement</span>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Impressions</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>658,400</p>
          <span style={{ fontSize: '12px', color: '#10B981' }}>+18% vs last month</span>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Avg Position</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>7.5</p>
          <span style={{ fontSize: '12px', color: '#10B981' }}>-1.2 improvement</span>
        </div>
      </div>

      {/* Simple Traffic Chart */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1F2937' }}>
          Traffic Trend (Last 5 Days)
        </h3>
        <div style={{ display: 'flex', alignItems: 'end', gap: '16px', height: '200px' }}>
          {trafficData.map((data, index) => {
            const maxTraffic = Math.max(...trafficData.map(d => d.organicTraffic));
            const height = (data.organicTraffic / maxTraffic) * 150;
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div
                  style={{
                    width: '40px',
                    height: `${height}px`,
                    backgroundColor: '#3B82F6',
                    borderRadius: '4px 4px 0 0',
                    marginBottom: '8px',
                    position: 'relative'
                  }}
                  title={`${data.organicTraffic} visitors`}
                />
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {new Date(data.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                </span>
                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                  {data.organicTraffic}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContentTab = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Content Performance
      </h2>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Content
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Organic Traffic
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Backlinks
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Avg Time on Page
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Bounce Rate
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Conversion Rate
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                Client
              </th>
            </tr>
          </thead>
          <tbody>
            {contentMetrics.map((content, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937', marginBottom: '4px' }}>
                      {content.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#3B82F6' }}>
                      {content.pageUrl}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      Published: {new Date(content.publishDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                    {content.organicTraffic.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    {content.backlinks}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    {Math.floor(content.avgTimeOnPage / 60)}m {content.avgTimeOnPage % 60}s
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '14px',
                    color: content.bounceRate < 40 ? '#10B981' : content.bounceRate < 60 ? '#F59E0B' : '#EF4444'
                  }}>
                    {content.bounceRate}%
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '14px',
                    color: content.conversionRate > 3 ? '#10B981' : content.conversionRate > 1 ? '#F59E0B' : '#EF4444'
                  }}>
                    {content.conversionRate}%
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#6B7280' }}>
                  {content.client}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderROITab = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Client ROI & Performance
      </h2>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {roiData.map(client => (
          <div key={client.clientId} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                {client.clientName}
              </h3>
              <span style={{
                padding: '6px 12px',
                backgroundColor: client.roi > 400 ? '#ECFDF5' : client.roi > 200 ? '#FEF3C7' : '#FEE2E2',
                color: client.roi > 400 ? '#059669' : client.roi > 200 ? '#D97706' : '#DC2626',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {client.roi}% ROI
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Monthly Investment</h4>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
                  ${client.monthlySpend.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Estimated Value</h4>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>
                  ${client.estimatedValue.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Traffic Increase</h4>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#3B82F6' }}>
                  +{client.organicTrafficIncrease}%
                </p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Lead Generation</h4>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#8B5CF6' }}>
                  {client.leadGeneration} leads
                </p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Keywords Ranking</h4>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#F59E0B' }}>
                  {client.keywordsRanking}
                </p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Content Pieces</h4>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#EF4444' }}>
                  {client.contentPieces}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Automated Reports
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
            📊 Monthly SEO Report
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            Comprehensive monthly performance report including rankings, traffic, and content metrics.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Last generated: Jan 1, 2024</span>
          </div>
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
            Generate Report
          </button>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
            📈 Traffic Analysis Report
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            Detailed traffic analysis with competitor comparisons and growth opportunities.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Last generated: Dec 28, 2023</span>
          </div>
          <button style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Generate Report
          </button>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
            💰 ROI Performance Report
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            Client-specific ROI analysis showing investment returns and value generated.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Last generated: Jan 5, 2024</span>
          </div>
          <button style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Generate Report
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
            Analytics & Reporting
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '16px' }}>
            Track performance, analyze trends, and generate insights for your SEO campaigns
          </p>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#6B7280', alignSelf: 'center' }}>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Clients</option>
              <option value="client-1">Local Restaurant Chain</option>
              <option value="client-2">SaaS Startup</option>
              <option value="client-3">E-commerce Store</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex' }}>
          {[
            { id: 'rankings', label: 'Rankings', icon: '🎯' },
            { id: 'traffic', label: 'Traffic', icon: '📈' },
            { id: 'content', label: 'Content', icon: '📄' },
            { id: 'roi', label: 'ROI', icon: '💰' },
            { id: 'reports', label: 'Reports', icon: '📊' }
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
        {activeTab === 'rankings' && renderRankingsTab()}
        {activeTab === 'traffic' && renderTrafficTab()}
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'roi' && renderROITab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>
    </div>
  );
}