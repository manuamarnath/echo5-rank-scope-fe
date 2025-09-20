import { useState, useEffect } from 'react';

interface Client {
  _id: string;
  name: string;
  industry: string;
  website?: string;
  locations: Array<{
    city: string;
    state: string;
    country: string;
    radius: number;
    radiusUnit: string;
  }>;
  services: string[];
  competitors: string[];
}

interface Keyword {
  _id: string;
  text: string;
  isPrimary: boolean;
  priority?: number;
  intent: string;
  volume?: number;
  difficulty?: number;
  currentRank?: number;
  previousRank?: number;
  targetLocation?: string;
}

interface RankResult {
  keyword: string;
  keywordId: string;
  position: number | null;
  url: string | null;
  searchEngine: string;
  location: string;
  device: string;
  checkedAt: string;
  error?: string;
}

export default function KeywordRankChecker() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [rankResults, setRankResults] = useState<RankResult[]>([]);
  const [searchEngine, setSearchEngine] = useState<string>('google');
  const [device, setDevice] = useState<string>('desktop');
  const [location, setLocation] = useState<string>('');
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'primary' | 'seed'>('all');
  const [domain, setDomain] = useState<string>('');

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Load keywords when client is selected
  useEffect(() => {
    if (selectedClientId) {
      fetchKeywords(selectedClientId);
      
      // Set default data from selected client
      const selectedClient = clients.find(c => c._id === selectedClientId);
      if (selectedClient) {
        // Set domain from client website
        if (selectedClient.website) {
          setDomain(selectedClient.website);
        }
        
        // Set default location from client's first location
        if (selectedClient.locations.length > 0) {
          const firstLocation = selectedClient.locations[0];
          const locationString = [
            firstLocation.city,
            firstLocation.state,
            firstLocation.country
          ].filter(Boolean).join(', ');
          setLocation(locationString);
        }
      }
    } else {
      setKeywords([]);
      setSelectedKeywords([]);
      setDomain('');
      setLocation('');
    }
  }, [selectedClientId, clients]);

  const fetchClients = async () => {
    try {
      console.log('Attempting to fetch clients...');
      
      // Try the proxy endpoint first
      let response = await fetch('/api/clients/demo');
      
      // If proxy fails, try direct backend connection
      if (!response.ok) {
        console.log('Proxy failed, trying direct backend connection...');
        response = await fetch('http://localhost:5000/clients/demo');
      }
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        console.log('Fetched clients successfully:', data);
      } else {
        console.error('Failed to fetch clients:', response.status, response.statusText);
        // Set an error state or show message to user
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Try direct backend as fallback
      try {
        console.log('Trying direct backend connection as fallback...');
        const response = await fetch('http://localhost:5000/clients/demo');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
          console.log('Fetched clients via direct connection:', data);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setClients([]);
      }
    }
  };

  const fetchKeywords = async (clientId: string) => {
    try {
      const response = await fetch(`/api/keywords?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        // Handle paginated response structure
        setKeywords(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
  };

  const handleKeywordSelection = (keywordId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeywords(prev => [...prev, keywordId]);
    } else {
      setSelectedKeywords(prev => prev.filter(id => id !== keywordId));
    }
  };

  const selectAllKeywords = () => {
    setSelectedKeywords(keywords.map(k => k._id));
  };

  const deselectAllKeywords = () => {
    setSelectedKeywords([]);
  };

  const checkRanks = async () => {
    if (!selectedClientId || selectedKeywords.length === 0 || !domain.trim()) {
      alert('Please select a client, keywords, and enter your domain');
      return;
    }

    setIsChecking(true);
    setRankResults([]);

    try {
      const response = await fetch('/api/keywords/check-ranks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClientId,
          keywordIds: selectedKeywords,
          domain: domain.trim(),
          searchEngine,
          device,
          location: location.trim()
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setRankResults(results);
      } else {
        const error = await response.json();
        alert(`Error checking ranks: ${error.message}`);
      }
    } catch (error) {
      console.error('Error checking ranks:', error);
      alert('Failed to check ranks. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getRankChangeIcon = (current: number | null, previous: number | null) => {
    if (!current || !previous) return '';
    if (current < previous) return '📈'; // Improved rank (lower number is better)
    if (current > previous) return '📉'; // Worse rank
    return '➡️'; // No change
  };

  const getRankChangeColor = (current: number | null, previous: number | null) => {
    if (!current || !previous) return '#6b7280';
    if (current < previous) return '#10b981'; // Green for improvement
    if (current > previous) return '#ef4444'; // Red for decline
    return '#6b7280'; // Gray for no change
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
          Keyword Rank Checker
        </h2>
      </div>

      {/* Configuration Section */}
      <div style={{ 
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Search Configuration
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Client *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="">
                {clients.length === 0 ? 'No clients found - create clients first' : 'Select a client'}
              </option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.industry})
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '0.5rem', 
                backgroundColor: '#fef3c7', 
                border: '1px solid #f59e0b',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: '#92400e'
              }}>
                ⚠️ No clients available. Please go to the <a href="/clients" style={{ color: '#92400e', textDecoration: 'underline' }}>Clients page</a> to create a client first.
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Domain * {clients.find(c => c._id === selectedClientId)?.website && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'normal' }}>
                  (auto-filled from client data)
                </span>
              )}
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
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
              Search Engine
            </label>
            <select
              value={searchEngine}
              onChange={(e) => setSearchEngine(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Device
            </label>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Location {selectedClientId && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'normal' }}>
                  (from client locations)
                </span>
              )}
            </label>
            {selectedClientId && clients.find(c => c._id === selectedClientId)?.locations.length > 1 ? (
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Select location</option>
                {clients.find(c => c._id === selectedClientId)?.locations.map((loc, index) => {
                  const locationString = [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
                  return (
                    <option key={index} value={locationString}>
                      {locationString} ({loc.radius} {loc.radiusUnit} radius)
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New York, NY"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Client Information Display */}
      {selectedClientId && (
        <div style={{ 
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          {(() => {
            const selectedClient = clients.find(c => c._id === selectedClientId);
            return selectedClient ? (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0369a1' }}>
                  📋 Client Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <strong>Industry:</strong> {selectedClient.industry}
                  </div>
                  <div>
                    <strong>Website:</strong> {selectedClient.website || 'Not specified'}
                  </div>
                  <div>
                    <strong>Services:</strong> {selectedClient.services?.length > 0 ? selectedClient.services.join(', ') : 'Not specified'}
                  </div>
                  <div>
                    <strong>Locations:</strong> {selectedClient.locations?.length || 0} location(s)
                  </div>
                  <div>
                    <strong>Competitors:</strong> {selectedClient.competitors?.length || 0} tracked
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Keywords Selection */}
      {selectedClientId && (
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
              Select Keywords ({keywords.length} total)
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value as any)}
                style={{
                  padding: '0.25rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem'
                }}
              >
                <option value="all">All Keywords</option>
                <option value="primary">Primary Only</option>
                <option value="seed">Seed Only</option>
              </select>
              <button
                onClick={selectAllKeywords}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Select All
              </button>
              <button
                onClick={deselectAllKeywords}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Deselect All
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
            {(() => {
              const filteredKeywords = keywords.filter(keyword => {
                if (keywordFilter === 'primary') return keyword.isPrimary;
                if (keywordFilter === 'seed') return !keyword.isPrimary;
                return true; // 'all'
              });

              if (filteredKeywords.length > 0) {
                return (
                  <div style={{ padding: '0.75rem' }}>
                    {filteredKeywords.map(keyword => (
                      <label
                        key={keyword._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderRadius: '0.25rem',
                          backgroundColor: selectedKeywords.includes(keyword._id) ? '#f0f9ff' : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedKeywords.includes(keyword._id)}
                          onChange={(e) => handleKeywordSelection(keyword._id, e.target.checked)}
                          style={{ margin: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: keyword.isPrimary ? '600' : 'normal' }}>
                              {keyword.text}
                            </span>
                            {keyword.isPrimary && (
                              <span style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                PRIMARY
                              </span>
                            )}
                            {keyword.currentRank && (
                              <span style={{
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem'
                              }}>
                                #{keyword.currentRank}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {keyword.intent} • {keyword.volume ? `${keyword.volume} searches` : 'No volume data'}
                            {keyword.targetLocation && ` • ${keyword.targetLocation}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    {keywordFilter === 'all' 
                      ? 'No keywords found for this client'
                      : `No ${keywordFilter} keywords found for this client`
                    }
                  </div>
                );
              }
            })()}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {selectedKeywords.length} of {keywords.length} keywords selected
            </div>
            <button
              onClick={checkRanks}
              disabled={isChecking || selectedKeywords.length === 0 || !domain.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: (isChecking || selectedKeywords.length === 0 || !domain.trim()) ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: (isChecking || selectedKeywords.length === 0 || !domain.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {isChecking ? 'Checking Ranks...' : `Check Ranks (${selectedKeywords.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {rankResults.length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Rank Check Results
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Keyword
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Position
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Change
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    URL
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Engine
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Checked
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankResults.map((result, index) => {
                  const keyword = keywords.find(k => k._id === result.keywordId);
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div>
                          <span style={{ fontWeight: keyword?.isPrimary ? '600' : 'normal' }}>
                            {result.keyword}
                          </span>
                          {keyword?.isPrimary && (
                            <span style={{
                              marginLeft: '0.5rem',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem'
                            }}>
                              PRIMARY
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {result.error ? (
                          <span style={{ color: '#ef4444' }}>Error</span>
                        ) : result.position ? (
                          <span style={{
                            backgroundColor: result.position <= 10 ? '#dcfce7' : result.position <= 50 ? '#fef3c7' : '#fee2e2',
                            color: result.position <= 10 ? '#166534' : result.position <= 50 ? '#92400e' : '#dc2626',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontWeight: '500'
                          }}>
                            #{result.position}
                          </span>
                        ) : (
                          <span style={{ color: '#6b7280' }}>Not found</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ 
                          color: getRankChangeColor(result.position, keyword?.previousRank),
                          fontSize: '1.125rem'
                        }}>
                          {getRankChangeIcon(result.position, keyword?.previousRank)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', maxWidth: '200px' }}>
                        {result.url ? (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#3b82f6',
                              textDecoration: 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {result.url}
                          </a>
                        ) : (
                          <span style={{ color: '#6b7280' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', textTransform: 'capitalize' }}>
                        {result.searchEngine}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                        {new Date(result.checkedAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}