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
  secondaryKeywords: Array<{keyword: string; targetLocation?: string; notes?: string}>;
  seedKeywords: Array<{keyword: string; searchVolume?: number; difficulty?: number; intent?: 'informational' | 'transactional' | 'navigational' | 'local'; source: 'csv' | 'gsc' | 'manual'}>;
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
  const [editingClient, setEditingClient] = useState<Client | null>(null);
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

  const handleClientUpdate = async (clientData: ClientFormData) => {
    if (!editingClient) return;

    try {
      console.log('Updating client data:', clientData);
      
      // Call backend API to update client
      const response = await fetch(`/api/clients/demo/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update client');
      }

      const updatedClient: BackendClient = await response.json();
      console.log('Client updated successfully:', updatedClient);

      // Update local state
      const formattedClient: Client = {
        id: updatedClient._id,
        name: updatedClient.name,
        industry: updatedClient.industry,
        locations: updatedClient.locations?.map((loc: {city: string; state: string}) => `${loc.city}, ${loc.state}`) || [],
        services: updatedClient.services || [],
        competitors: updatedClient.competitors || [],
        integrations: updatedClient.integrations || {
          googleSearchConsole: false,
          googleAnalytics: false,
          googleBusinessProfile: false,
        },
        createdAt: updatedClient.createdAt || new Date().toISOString()
      };
      
      setClients(prev => prev.map(client => 
        client.id === editingClient.id ? formattedClient : client
      ));
      setEditingClient(null);
      
      alert('Client updated successfully!');
    } catch (error) {
      console.error('Failed to update client:', error);
      alert(`Failed to update client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClientDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting client:', clientId);
      
      // Call backend API to delete client
      const response = await fetch(`/api/clients/demo/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }

      console.log('Client deleted successfully');

      // Remove from local state
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      alert('Client deleted successfully!');
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert(`Failed to delete client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  if (showOnboarding) {
    return (
      <ClientOnboardingForm
        onComplete={handleClientComplete}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  if (editingClient) {
    // Convert client data to form format for editing
    const clientFormData: ClientFormData = {
      name: editingClient.name,
      industry: editingClient.industry,
      website: '', // We don't store website in the current client model
      locations: editingClient.locations.map(loc => {
        const [city, state] = loc.split(', ');
        return {
          city: city || '',
          state: state || '',
          country: '',
          zip: '',
          radius: 25,
          radiusUnit: 'miles' as const
        };
      }),
      services: editingClient.services,
      competitors: editingClient.competitors,
      primaryKeywords: [], // We'd need to fetch these from the keywords table
      secondaryKeywords: [], // We'd need to fetch these from the keywords table
      seedKeywords: [], // We'd need to fetch these from the keywords table
      integrations: editingClient.integrations
    };

    return (
      <ClientOnboardingForm
        initialData={clientFormData}
        onComplete={handleClientUpdate}
        onCancel={() => setEditingClient(null)}
        isEditing={true}
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
              Get started by adding your first client to the Seo-Ops OS platform.
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
                  {user?.role === 'owner' && (
                    <>
                      <button
                        onClick={() => handleEditClient(client)}
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
                        Edit
                      </button>
                      <button
                        onClick={() => handleClientDelete(client.id)}
                        style={{ 
                          flex: 1,
                          padding: '0.5rem', 
                          backgroundColor: '#dc2626', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}