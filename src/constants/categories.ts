import { EventCategory } from '../types/event';

export interface CategoryMeta {
  id: EventCategory;
  name: string;
  icon: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'All', name: 'All Events', icon: 'apps-outline' },
  { id: 'Music', name: 'Music', icon: 'musical-notes-outline' },
  { id: 'Technology', name: 'Tech & AI', icon: 'hardware-chip-outline' },
  { id: 'Sports', name: 'Sports & Fitness', icon: 'football-outline' },
  { id: 'Arts & Theatre', name: 'Arts & Drama', icon: 'color-palette-outline' },
  { id: 'Food & Drink', name: 'Food & Wine', icon: 'restaurant-outline' },
  { id: 'Business & Networking', name: 'Business', icon: 'briefcase-outline' },
  { id: 'Workshop', name: 'Workshops', icon: 'school-outline' },
];
