import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/components/auth/AuthContext';
import MainLayout from '../src/components/layout/MainLayout';
import ClientOnboardingForm from '../src/components/client/ClientOnboardingForm';

interface Client {
  id: string;
  name: string;
  industry: string;
  locations: string[];
  services: string[];
  competitors: string[];
  integrations: {
    googleSearchConsole: boolean;
    googleAnalytics: boolean;
    googleBusinessProfile: boolean;
  };
  createdAt: string;
}

interface ClientFormData {
  name: string;
  industry: string;
  website: string;
  locations: Array<{city: string; state: string; country: string; zip: string; radius: number; radiusUnit: 'miles' | 'km'}>;
  services: string[];
  competitors: string[];
  primaryKeywords: Array<{keyword: string; priority: number; targetLocation?: string; notes?: string}>;
  seedKeywords: Array<{keyword: string; searchVolume?: number; difficulty?: number; intent?: string; source: string}>;
  integrations: {
    googleSearchConsole: boolean;
    googleAnalytics: boolean;
    googleBusinessProfile: boolean;
  };
}

interface BackendClient {
  _id: string;
  name: string;
  industry: string;
  locations?: Array<{city: string; state: string}>;
  services?: string[];
  competitors?: string[];
  integrations?: {
    googleSearchConsole: boolean;
    googleAnalytics: boolean;
    googleBusinessProfile: boolean;
  };
  createdAt?: string;
}

export default function ClientsPage() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch clients from backend
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients/demo');
      if (response.ok) {
        const backendClients: BackendClient[] = await response.json();
        const formattedClients = backendClients.map((client: BackendClient) => ({
          id: client._id,
          name: client.name,
          industry: client.industry,
          locations: client.locations?.map((loc: {city: string; state: string}) => `${loc.city}, ${loc.state}`) || [],
          services: client.services || [],
          competitors: client.competitors || [],
          integrations: client.integrations || {
            googleSearchConsole: false,
            googleAnalytics: false,
            googleBusinessProfile: false,
          },
          createdAt: client.createdAt || new Date().toISOString()
        }));
        setClients(formattedClients);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load clients when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientComplete = async (clientData: ClientFormData) => {
    try {
      console.log('Submitting client data:', clientData);
      
      // Call backend API to create client
      const response = await fetch('/api/clients/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      const savedClient: BackendClient = await response.json();
      console.log('Client saved successfully:', savedClient);

      // Add to local state for immediate UI update
      const newClient: Client = {
        id: savedClient._id,
        name: savedClient.name,
        industry: savedClient.industry,
        locations: savedClient.locations?.map((loc: {city: string; state: string}) => `${loc.city}, ${loc.state}`) || [],
        services: savedClient.services || [],
        competitors: savedClient.competitors || [],
        integrations: savedClient.integrations || {
          googleSearchConsole: false,
          googleAnalytics: false,
          googleBusinessProfile: false,
        },
        createdAt: savedClient.createdAt || new Date().toISOString()
      };
      
      setClients(prev => [...prev, newClient]);
      setShowOnboarding(false);
      
      alert('Client created successfully!');
    } catch (error) {
      console.error('Failed to create client:', error);
      alert(`Failed to create client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (showOnboarding) {
    return (
      <ClientOnboardingForm
        onComplete={handleClientComplete}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div>Loading clients...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            margin: 0 
          }}>
            Clients
          </h1>
          {user?.role === 'owner' && (
            <button
              onClick={() => setShowOnboarding(true)}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#4f46e5', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Add New Client
            </button>
          )}
        </div>

        {clients.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            backgroundColor: 'white', 
            borderRadius: '0.5rem',
            border: '2px dashed #e5e7eb'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              No clients yet
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Get started by adding your first client to the RankScope platform.
            </p>
            {user?.role === 'owner' && (
              <button
                onClick={() => setShowOnboarding(true)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#4f46e5', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
          }}>
            {clients.map((client) => (
              <div
                key={client.id}
                style={{ 
                  backgroundColor: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  {client.name}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  {client.industry}
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Locations:
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {client.locations.join(', ')}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Services:
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {client.services.join(', ')}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Integrations:
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {client.integrations.googleSearchConsole && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: '#dbeafe', 
                        color: '#1d4ed8',
                        borderRadius: '0.25rem'
                      }}>
                        GSC
                      </span>
                    )}
                    {client.integrations.googleAnalytics && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: '#dcfce7', 
                        color: '#166534',
                        borderRadius: '0.25rem'
                      }}>
                        GA4
                      </span>
                    )}
                    {client.integrations.googleBusinessProfile && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: '#fef3c7', 
                        color: '#92400e',
                        borderRadius: '0.25rem'
                      }}>
                        GBP
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <button
                    style={{ 
                      flex: 1,
                      padding: '0.5rem', 
                      backgroundColor: '#f3f4f6', 
                      color: '#374151', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    View Details
                  </button>
                  <button
                    style={{ 
                      flex: 1,
                      padding: '0.5rem', 
                      backgroundColor: '#4f46e5', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}