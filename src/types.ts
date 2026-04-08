export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'organizer' | 'participant';
  createdAt: string;
}

export interface RegistrationField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'select';
  required: boolean;
  options?: string[];
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  location: string;
  bannerUrl?: string;
  organizerId: string;
  pixKey: string;
  price: number;
  registrationFields: RegistrationField[];
  sponsors: Sponsor[];
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  participantId: string;
  organizerId: string;
  participantData: Record<string, any>;
  paymentProofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
