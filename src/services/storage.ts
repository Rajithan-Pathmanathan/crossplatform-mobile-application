import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { Event } from '../types/event';
import { Booking } from '../types/booking';

const KEYS = {
  USER_SESSION: '@eventhub_user_session',
  FAVORITES: '@eventhub_favorites',
  EVENTS_CACHE: '@eventhub_events_cache',
  BOOKINGS_CACHE: '@eventhub_bookings_cache',
};

export const StorageService = {
  // User Session
  async saveUserSession(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user session:', e);
    }
  },

  async getUserSession(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading user session:', e);
      return null;
    }
  },

  async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER_SESSION);
    } catch (e) {
      console.error('Error clearing user session:', e);
    }
  },

  // Favorites / Bookmarks
  async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading favorites:', e);
      return [];
    }
  },

  async toggleFavorite(eventId: string): Promise<string[]> {
    try {
      const current = await this.getFavorites();
      const exists = current.includes(eventId);
      const updated = exists ? current.filter(id => id !== eventId) : [...current, eventId];
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error toggling favorite:', e);
      return [];
    }
  },

  async isFavorite(eventId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(eventId);
  },

  // Events Cache
  async getStoredEvents(): Promise<Event[] | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.EVENTS_CACHE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting stored events:', e);
      return null;
    }
  },

  async saveStoredEvents(events: Event[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.EVENTS_CACHE, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving stored events:', e);
    }
  },

  // Bookings Cache
  async getStoredBookings(): Promise<Booking[] | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKINGS_CACHE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting stored bookings:', e);
      return null;
    }
  },

  async saveStoredBookings(bookings: Booking[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.BOOKINGS_CACHE, JSON.stringify(bookings));
    } catch (e) {
      console.error('Error saving stored bookings:', e);
    }
  },
};
