export type EventCategory = 
  | 'All' 
  | 'Music' 
  | 'Technology' 
  | 'Sports' 
  | 'Arts & Theatre' 
  | 'Food & Drink' 
  | 'Business & Networking' 
  | 'Workshop';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image: string;
  organizerId: string;
  organizerName: string;
  featured?: boolean;
  createdAt: string;
}

export interface EventFilter {
  searchQuery?: string;
  category?: EventCategory;
  onlyAvailable?: boolean;
}
