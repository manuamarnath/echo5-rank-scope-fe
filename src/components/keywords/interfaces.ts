export interface Keyword {
  id?: string;
  _id?: string;
  text: string;
  intent?: string;
  searchVolume?: number;
  volume?: number;
  difficulty?: number;
  geo?: string;
  allocatedTo?: string;
  role?: 'owner' | 'employee' | 'client';
  status?: 'pending' | 'allocated' | 'in-progress' | 'completed';
  isPrimary?: boolean;
  currentRank?: number;
  targetLocation?: string;
  previousRank?: number;
}

export interface Client {
  _id: string;
  name: string;
  industry: string;
  website?: string;
  locations?: Array<{
    city: string;
    state: string;
    country: string;
    radius?: number;
    radiusUnit?: string;
  }>;
  services?: string[];
  competitors?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'employee' | 'client';
}

export interface KeywordAllocationProps {
  onClose?: () => void;
  clientId?: string;
}