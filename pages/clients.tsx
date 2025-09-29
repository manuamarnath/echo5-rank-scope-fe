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
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

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
      setDeletingClient(null);
      
      alert('Client deleted successfully!');
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert(`Failed to delete client: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeletingClient(null);
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
            borderRadius: '8px',
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
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#4f46e5', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {clients.map((client) => (
              <div
                key={client.id}
                style={{ 
                  backgroundColor: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header */}
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.25rem',
                    color: '#111827'
                  }}>
                    {client.name}
                  </h3>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '0.875rem'
                  }}>
                    {client.industry}
                  </p>
                </div>

                {/* Content */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  
                  {/* Locations */}
                  {client.locations.length > 0 && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Locations
                      </div>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#374151'
                      }}>
                        {client.locations.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Services */}
                  {client.services.length > 0 && (
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Services
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {client.services.slice(0, 3).map((service, index) => (
                          <span key={index} style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.5rem', 
                            backgroundColor: '#f3f4f6', 
                            color: '#374151',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {service}
                          </span>
                        ))}
                        {client.services.length > 3 && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            +{client.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Integrations */}
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      Integrations
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {client.integrations.googleSearchConsole && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.5rem', 
                          backgroundColor: '#dbeafe', 
                          color: '#1d4ed8',
                          borderRadius: '4px',
                          fontWeight: '500'
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
                          borderRadius: '4px',
                          fontWeight: '500'
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
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          GBP
                        </span>
                      )}
                      {!client.integrations.googleSearchConsole && 
                       !client.integrations.googleAnalytics && 
                       !client.integrations.googleBusinessProfile && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          None
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <button
                    onClick={() => setViewingClient(client)}
                    style={{ 
                      flex: 1,
                      padding: '0.5rem 0.75rem', 
                      backgroundColor: '#f9fafb', 
                      color: '#374151', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                  >
                    View
                  </button>
                  {user?.role === 'owner' && (
                    <>
                      <button
                        onClick={() => handleEditClient(client)}
                        style={{ 
                          padding: '0.5rem 0.75rem', 
                          backgroundColor: '#4f46e5', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          minWidth: '60px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingClient(client)}
                        style={{ 
                          padding: '0.5rem 0.75rem', 
                          backgroundColor: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          minWidth: '60px'
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

        {/* Modern Client Details Modal */}
        {viewingClient && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={() => setViewingClient(null)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                marginTop:"100px",
                borderRadius: '16px',
                maxWidth: '650px',
                width: '100%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: '2rem 2rem 1rem 2rem',
                borderBottom: '1px solid #f1f5f9',
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                borderRadius: '16px 16px 0 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{
                      fontSize: '1.875rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      margin: 0,
                      marginBottom: '0.5rem'
                    }}>
                      {viewingClient.name}
                    </h2>
                    <p style={{
                      fontSize: '1rem',
                      color: '#64748b',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {viewingClient.industry}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingClient(null)}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      color: '#64748b',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e2e8f0';
                      e.currentTarget.style.color = '#334155';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ 
                padding: '2rem',
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                <div style={{ display: 'grid', gap: '2rem' }}>
                  
                  {/* Basic Info */}
                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#334155',
                      margin: 0,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📋 Basic Information
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Created:</span>
                        <span style={{ color: '#334155', fontWeight: '600' }}>
                          {new Date(viewingClient.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Client ID:</span>
                        <span style={{ color: '#334155', fontWeight: '600', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                          {viewingClient.id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#334155',
                      margin: 0,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📍 Locations ({viewingClient.locations.length})
                    </h3>
                    {viewingClient.locations.length > 0 ? (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {viewingClient.locations.map((location, index) => (
                          <div key={index} style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            color: '#334155'
                          }}>
                            {location}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                        No locations specified
                      </p>
                    )}
                  </div>

                  {/* Services */}
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#334155',
                      margin: 0,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🛠️ Services ({viewingClient.services.length})
                    </h3>
                    {viewingClient.services.length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {viewingClient.services.map((service, index) => (
                          <span key={index} style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            border: '1px solid #dbeafe'
                          }}>
                            {service}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                        No services specified
                      </p>
                    )}
                  </div>

                  {/* Competitors */}
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#334155',
                      margin: 0,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🏆 Competitors ({viewingClient.competitors.length})
                    </h3>
                    {viewingClient.competitors.length > 0 ? (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {viewingClient.competitors.map((competitor, index) => (
                          <div key={index} style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#991b1b'
                          }}>
                            {competitor}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                        No competitors specified
                      </p>
                    )}
                  </div>

                  {/* Integrations */}
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#334155',
                      margin: 0,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔗 Integrations
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {[
                        { key: 'googleSearchConsole', name: 'Google Search Console', icon: '🔍' },
                        { key: 'googleAnalytics', name: 'Google Analytics', icon: '📊' },
                        { key: 'googleBusinessProfile', name: 'Google Business Profile', icon: '🏢' }
                      ].map((integration) => (
                        <div key={integration.key} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{integration.icon}</span>
                            <span style={{ color: '#334155', fontWeight: '500' }}>{integration.name}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: viewingClient.integrations[integration.key as keyof typeof viewingClient.integrations] ? '#dcfce7' : '#fef2f2',
                            color: viewingClient.integrations[integration.key as keyof typeof viewingClient.integrations] ? '#166534' : '#991b1b'
                          }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: viewingClient.integrations[integration.key as keyof typeof viewingClient.integrations] ? '#22c55e' : '#ef4444'
                            }}></span>
                            {viewingClient.integrations[integration.key as keyof typeof viewingClient.integrations] ? 'Connected' : 'Not Connected'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc',
                borderRadius: '0 0 16px 16px',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                {user?.role === 'owner' && (
                  <button
                    onClick={() => {
                      setViewingClient(null);
                      handleEditClient(viewingClient);
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4338ca';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                    }}
                  >
                    Edit Client
                  </button>
                )}
                <button
                  onClick={() => setViewingClient(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingClient && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              padding: '1rem'
            }}
            onClick={() => setDeletingClient(null)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: '2rem 2rem 1rem 2rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <span style={{ fontSize: '2rem' }}>⚠️</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#dc2626',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  Delete Client
                </h2>
                <p style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Are you sure you want to delete <strong>{deletingClient.name}</strong>?
                </p>
              </div>

              {/* Content */}
              <div style={{ 
                padding: '0 2rem 1rem 2rem',
                textAlign: 'center'
              }}>
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#991b1b',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    ⚠️ This action cannot be undone. All client data, including locations, services, and integration settings will be permanently deleted.
                  </p>
                </div>

                {/* Client Info Summary */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Industry:</span>
                      <span style={{ color: '#334155', fontWeight: '500' }}>{deletingClient.industry}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Locations:</span>
                      <span style={{ color: '#334155', fontWeight: '500' }}>{deletingClient.locations.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Services:</span>
                      <span style={{ color: '#334155', fontWeight: '500' }}>{deletingClient.services.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Active Integrations:</span>
                      <span style={{ color: '#334155', fontWeight: '500' }}>
                        {[deletingClient.integrations.googleSearchConsole, deletingClient.integrations.googleAnalytics, deletingClient.integrations.googleBusinessProfile].filter(Boolean).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setDeletingClient(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClientDelete(deletingClient.id)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}